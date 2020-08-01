/**
 * CHATIBLE implementation (aka the most important part of this project).
 * @packageDocumentation
 */

import db from '../db';
import lang from '../lang';
import config from '../config';

import fb from '../utils/facebook';
import logger from '../utils/logger';
import gifts from '../utils/gifts';
import isNude from '../utils/nudedetect';

import GenderEnum from '../enums/GenderEnum';
import StateEnum from '../enums/StateEnum';
import { WebhookMessagingEvent, WebhookMessageObject } from '../interfaces/FacebookAPI';
import gender from '../db/models/gender';
import state from '../db/models/state';
import { isRegExp } from 'util';


/**
 * Parse string to get gender
 * @param genderString - String to parse
 * @returns Parsed gender
 */
const parseGender = (genderString: string): GenderEnum | null => {
  let res: GenderEnum | null;
  if (genderString === lang.KEYWORD_GENDER + lang.KEYWORD_GENDER_MALE) {
    res = GenderEnum.FEMALE;
  } else if (genderString === lang.KEYWORD_GENDER + lang.KEYWORD_GENDER_FEMALE) {
    res = GenderEnum.MALE;
  } else if (genderString === lang.KEYWORD_GENDER + lang.KEYWORD_GENDER_BOTH) {
    res = GenderEnum.UNKNOWN;
  } else {
    res = null;
  }
  return res;
};

/**
 * Get gender of user from database if available.
 * Otherwise, get it from Facebook.
 * @param id - ID of user
 * @returns Gender of user
 */
const getGender = async (id: string): Promise<GenderEnum> => {
  let gender: GenderEnum | null = await db.getGender(id);
  if (gender) {
    return gender;
  }

  // not found in database, fetch from facebook
  const data = await fb.getUserData(id);
  if (data.error || !data.gender) {
    gender = GenderEnum.UNKNOWN;
  } else if (data.gender === 'male') {
    gender = GenderEnum.MALE;
  } else if (data.gender === 'female') {
    gender = GenderEnum.FEMALE;
  }

  await db.setGender(id, gender as GenderEnum);
  return gender as GenderEnum;
};

/**
 * Connect two users and add them to chat room
 * @param id1 - ID of first user
 * @param id2 - ID of second user
 * @param gender1 - Gender of first user
 * @param gender2 - Gender of second user
 */
const pairPeople = async (id1: string, id2: string, gender1: GenderEnum, gender2: GenderEnum): Promise<void> => {
  await db.removeFromWaitRoom(id1);
  await db.removeFromWaitRoom(id2);
  await db.writeToChatRoom(id1, id2, gender1, gender2);
  await db.updateLastPerson(id1, id2);
  await db.updateLastPerson(id2, id1);
  await fb.sendTextMessage('', id1, lang.CONNECTED, false);
  await fb.sendTextMessage('', id2, lang.CONNECTED, false);
  await logger.logPair(id1, id2);
};

/**
 * Connect to admin
 * @param id1 - ID of user
 * @param id2 - ID of admin
 */
const pairAdmin = async (id1: string): Promise<void> => {
  await db.setState(id1, StateEnum.CHATADMIN);
  await fb.sendTextMessage('', id1, lang.ADMIN_CONNECTED, false);
  await fb.sendTextMessage('', config.DEV_ID, lang.ADMIN_USER_CONNECTED + id1, false);
};

/**
 * Check pair with admin
 * @param id - ID of new user
 * @param myState - Gender of new user
 */
const findPairAdmin = async (id: string, myState: StateEnum): Promise<void> => {
  
};
/**
 * Disconnect admin
 * @param id1 - ID of user
 * @param id2 - ID admin
 */
const processEndChatAdmin = async (id: string): Promise<void> => {
  await db.setState(id, StateEnum.CHATGENDER);
  await fb.sendTextMessage('', id, lang.ADMIN_END_CHAT, false);
  await fb.sendTextMessage('', config.DEV_ID, lang.ADMIN_END_CHAT_PARTNER + id, false);
};

/**
 * Find a user in wait room to match with new user.
 * If found, pair them. Otherwise, add new user to wait room.
 * @param id - ID of new user
 * @param myGender - Gender of new user
 */
const findPair = async (id: string, myGender: GenderEnum): Promise<void> => {
  
  //check state 
  const state = await db.getState(id);
  if(state === StateEnum.CHATADMIN)
  {
    await processEndChatAdmin(id);
  }

  const waitRoomList = await db.getListWaitRoom();

  for (const entry of waitRoomList) {
    const target = entry.id;
    const targetGender = entry.gender;

    // check if they have just been paired
    if ((await db.checkLastPerson(id, target)) || (await db.checkLastPerson(target, id))) {
      continue;
    }

    // pair if genders match
    // or there are too many people in wait room
    // or gender of one of them is unknown (with probability 0.2)

    const isPreferredGender =
      (myGender === GenderEnum.UNKNOWN && targetGender === GenderEnum.UNKNOWN) ||
      (myGender === GenderEnum.MALE && targetGender === GenderEnum.FEMALE) ||
      (myGender === GenderEnum.FEMALE && targetGender === GenderEnum.MALE);

    if (
      isPreferredGender ||
      waitRoomList.length > config.MAX_PEOPLE_IN_WAITROOM ||
      ((myGender === GenderEnum.UNKNOWN || targetGender === GenderEnum.UNKNOWN) && Math.random() > 0.8)
    ) {
      await pairPeople(id, target, myGender, targetGender);
      return;
    }
  }

  // found no match, put in wait room
  await db.writeToWaitRoom(id, myGender);

  if (myGender === GenderEnum.UNKNOWN) {
    await fb.sendTextMessage('', id, lang.START_WARN_GENDER, false);
  }
  await fb.sendTextMessage('', id, lang.START_OKAY, false);
};

/**
 * Disconnect paired users
 * @param id1 - ID of first user
 * @param id2 - ID of second user
 */
const processEndChat = async (id1: string, id2: string): Promise<void> => {
  await db.removeFromChatRoom(id1); // or await db.removeFromChatRoom(id2);
  await fb.sendTextButtons(id1, lang.END_CHAT, true, true, true, true, false);
  await fb.sendTextButtons(id2, lang.END_CHAT_PARTNER, true, true, true, true, false);
};


/**
 * Forward message from sender to receiver
 * @param sender - ID of sender
 * @param receiver - ID of receiver
 * @param data - Message data to forward
 */
const forwardMessage = async (sender: string, receiver: string, data: WebhookMessageObject): Promise<void> => {
  if (data.attachments) {
    if (data.attachments[0]) {
      const type = data.attachments[0].type;
      if (type === 'fallback') {
        let text: string;
        if (data.text) {
          text = data.text;
        } else {
          text = lang.ATTACHMENT_LINK + data.attachments[0].payload.url;
        }
        await fb.sendTextMessage(sender, receiver, text, true);
      } else if (type === 'image' || type === 'video' || type === 'audio' || type === 'file') {
        if(type === 'image') await isNude.sendImage(sender, receiver, data.attachments[0].payload.url);
        else await fb.sendAttachment(sender, receiver, type, data.attachments[0].payload.url, false, false, true);
      } else {
        await fb.sendTextMessage('', sender, lang.ERR_ATTACHMENT, false);
        return;
      }
    }

    for (let i = 1; i < data.attachments.length; i++) {
      const type = data.attachments[i].type;
      if (type === 'image' || type === 'video' || type === 'audio' || type === 'file') {
        if(type === 'image') await isNude.sendImage(sender, receiver, data.attachments[i].payload.url);
        else await fb.sendAttachment(sender, receiver, type, data.attachments[i].payload.url, false, false, true);
      }
    }
  } else {
    await fb.sendTextMessage(sender, receiver, data.text, true);
  }
};

/**
 * Get infomation ID
 * @param id : id user
 */
const getInfoUser = async (id: string): Promise<void> => {
  let info = '';
  const data = fb.getUserData(id);
  const waitState: boolean = await db.isInWaitRoom(id);
  const sender2: string | null = await db.findPartnerChatRoom(id);
  const state: StateEnum | null = await db.getState(id);
  const gender: GenderEnum = await getGender(id);

  let tt = '';
  if(waitState) tt = 'Đang tìm kiếm';
  else if(sender2) tt = 'Đã kết nối với id ' + sender2;
  else if(state === StateEnum.CHATADMIN) tt = 'Đã kết nối với admin';
  else tt = 'Chưa kết nối';

  let gt = '';
  if((await data).gender === 'male') gt = 'Nam';
  else if((await data).gender === 'female') gt = 'Nữ';
  else gt = 'Không xác định';

  info = 'Họ tên: ' + (await data).first_name + ' ' + (await data).last_name + '\n' +
        'ID của bạn: ' + id + '\n' +
        'Giới tính: ' + gt + '\n' + 
        'Trạng thái: ' + tt;
  
  await fb.sendTextButtons(id, info, false, false, true, true, false);

}
/**
 * Process messaging event sent by Facebook
 * @param event - Messaging event
 */
const processEvent = async (event: WebhookMessagingEvent): Promise<void> => {
  if (event.read) {
    event.message = { text: '' };
  }
  if(event.reaction) {
    event.message = { text: (event.reaction.action === 'react') ? ('Đã thả react : ' + event.reaction.emoji) : 'Đã bỏ react'};
  }
  if (event.postback && event.postback.payload) {
    event.message = { text: event.postback.payload };
  }

  if (!event.hasOwnProperty('message') || event.delivery) {
    return;
  }

  if (event.message.is_echo === true) {
    return;
  }

  const sender: string = event.sender.id;

  if (config.MAINTENANCE) {
    await fb.sendTextMessage('', sender, lang.MAINTENANCE, false);
    return;
  }

  let text = '';
  if (event.message.quick_reply && event.message.quick_reply.payload) {
    text = event.message.quick_reply.payload;
  } else if (event.message.text) {
    text = event.message.text;
  }

  let command = '';
  if (text.length < 20) {
    command = text.toLowerCase().replace(/ /g, '');
  }

  if (command === 'ʬ') {
    await fb.sendTextButtons(sender, lang.FIRST_COME, true, false, true, true, false);
    return;
  }

  // fetch person state
  const waitState: boolean = await db.isInWaitRoom(sender);
  const sender2: string | null = await db.findPartnerChatRoom(sender);
  const state: StateEnum | null = await db.getState(sender);

  
  if (!waitState && sender2 === null) {
    // neither in chat room nor wait room
    if(command === lang.KEYWORD_ADMIN_START){
      if(state === StateEnum.CHATADMIN){
         await fb.sendTextMessage('', sender, lang.ADMIN_ERR_CONNECTED, false);
      } else if(state === StateEnum.CHATGENDER || state === null){
          await pairAdmin(sender);
      }
    } 
    else if(command === lang.KEYWORD_ADMIN_END){
      if(state === StateEnum.CHATADMIN){
        await processEndChatAdmin(sender);
     } else if(state === StateEnum.CHATGENDER || state === null){
       await fb.sendTextMessage('', sender, lang.ADMIN_ERR_END, false);
     }
    } 
    else if (command === lang.KEYWORD_START) {
      const gender: GenderEnum = await getGender(sender);
      await findPair(sender, gender);
    } else if (command.startsWith(lang.KEYWORD_GENDER)) {
      const gender: GenderEnum | null = parseGender(command);
      if (gender === null) {
        await fb.sendTextButtons(sender, lang.GENDER_ERR, false, false, true, true, false);
      } else {
        let genderString = '';
        if (gender === GenderEnum.MALE) {
          genderString = lang.GENDER_ARR_FEMALE;
        } else if (gender === GenderEnum.FEMALE) {
          genderString = lang.GENDER_ARR_MALE;
        }

        if (gender !== GenderEnum.UNKNOWN) {
          await fb.sendTextMessage('', sender, lang.GENDER_WRITE_OK + genderString + lang.GENDER_WRITE_WARN, false);
        }

        await db.setGender(sender, gender);
        await findPair(sender, gender);
      }
    } else if (command === lang.KEYWORD_HELP) {
      await fb.sendTextButtons(sender, lang.HELP_TXT, true, false, true, true, false);
    } else if (command === lang.KEYWORD_CAT) {
      await gifts.sendCatPic(sender, null);
    } else if (command === lang.KEYWORD_DOG) {
      await gifts.sendDogPic(sender, null);
    } else if (command === lang.KEYWORD_GIRL) {
      await gifts.sendGirlPic(sender);
    } else if (command === lang.KEYWORD_INFO) {
      await getInfoUser(sender);
    }else if (!event.read) {
      if(state === StateEnum.CHATGENDER || state === null) await fb.sendTextButtons(sender, lang.INSTRUCTION, true, false, true, true, false);
      else if(state === StateEnum.CHATADMIN) await forwardMessage(sender, config.DEV_ID, event.message);
    }
  } else if (waitState && sender2 === null) {
    // in wait room and waiting
    if(command === lang.KEYWORD_ADMIN_START){
      if(state === StateEnum.CHATADMIN){
         await fb.sendTextMessage('', sender, lang.ADMIN_ERR_CONNECTED, false);
      } else if(state === StateEnum.CHATGENDER){
          await pairAdmin(sender);
      }
    } else if(command === lang.KEYWORD_ADMIN_END){
      if(state === StateEnum.CHATADMIN){
        await processEndChatAdmin(sender);
     } else if(state === StateEnum.CHATGENDER){
       await fb.sendTextMessage('', sender, lang.ADMIN_ERR_END, false);
     }
    } 
    else if (command === lang.KEYWORD_END) {
      await db.removeFromWaitRoom(sender);
      await fb.sendTextButtons(sender, lang.END_CHAT, true, false, true, true, false);
    } else if (command === lang.KEYWORD_HELP) {
      await fb.sendTextButtons(sender, lang.HELP_TXT, false, false, true, false, false);
    } else if (command === lang.KEYWORD_CAT) {
      await gifts.sendCatPic(sender, null);
    } else if (command === lang.KEYWORD_DOG) {
      await gifts.sendDogPic(sender, null);
    } else if (command === lang.KEYWORD_GIRL) {
      await gifts.sendGirlPic(sender);
    } else if (command === lang.KEYWORD_INFO) {
      await getInfoUser(sender);
    } else if (!event.read) {
      if(state === StateEnum.CHATGENDER || state === null) await fb.sendTextButtons(sender, lang.WAITING, false, false, true, false, false);
      else if(state === StateEnum.CHATADMIN) await forwardMessage(sender, config.DEV_ID, event.message);
    }
  } else if (!waitState && sender2 !== null) {
    // in chat room
    if(command === lang.KEYWORD_ADMIN_START){
      if(state === StateEnum.CHATADMIN){
         await fb.sendTextMessage('', sender, lang.ADMIN_ERR_CONNECTED, false);
      } else if(state === StateEnum.CHATGENDER || state === null){
          await pairAdmin(sender);
      }
    } else if(command === lang.KEYWORD_ADMIN_END){
      if(state === StateEnum.CHATADMIN){
        await processEndChatAdmin(sender);
     } else if(state === StateEnum.CHATGENDER || state === null){
       await fb.sendTextMessage('', sender, lang.ADMIN_ERR_END, false);
     }
    } 
    else if (command === lang.KEYWORD_END) {
      await processEndChat(sender, sender2);
    } else if (command === lang.KEYWORD_START || command.startsWith(lang.KEYWORD_GENDER)) {
      await fb.sendTextMessage('', sender, lang.START_ERR_ALREADY, false);
    } else if (command === lang.KEYWORD_HELP) {
      await fb.sendTextButtons(sender, lang.HELP_TXT, false, true, true, false, false);
    } else if (command === lang.KEYWORD_CAT) {
     // await forwardMessage(sender, sender2, event.message); // Send keyword_cat text to sender2
      await gifts.sendCatPic(sender, sender2);
    } else if (command === lang.KEYWORD_DOG) {
     // await forwardMessage(sender, sender2, event.message); // Send keyword_dog text to sender2
      await gifts.sendDogPic(sender, sender2);
    } else if (command === lang.KEYWORD_GIRL) {
      await gifts.sendGirlPic(sender);
    } else if (command === lang.KEYWORD_INFO) {
      await getInfoUser(sender);
    } else {
      // FIX-ME: Only send seen indicator for messages before watermark
      if (event.read) {
        await fb.sendSeenIndicator(sender2);
      } else if (text.trim().toLowerCase().startsWith('[bot]') || text.trim().toLowerCase().startsWith('[admin]')) {
        await fb.sendTextMessage('', sender, lang.ERR_FAKE_MSG, false);
      } else {
        if(state === StateEnum.CHATGENDER || state === null) await forwardMessage(sender, sender2, event.message);
        else if(state === StateEnum.CHATADMIN) await forwardMessage(sender, config.DEV_ID, event.message);
      }
    }
  } else {
    await db.removeFromWaitRoom(sender);
    await db.removeFromChatRoom(sender);
    await fb.sendTextMessage('', sender, lang.ERR_UNKNOWN, false);
  }
};

/**
 * Remove timeout users in wait room every minute.
 * Timeout is specified in config.
 */
const removeTimeoutUser = async (): Promise<void> => {
  const waitRoomList = await db.getListWaitRoom();

  const now = new Date();
  waitRoomList.forEach(async (entry) => {
    if (now.getTime() - entry.time.getTime() > config.MAX_WAIT_TIME_MINUTES * 60000) {
      await db.removeFromWaitRoom(entry.id);
      await fb.sendTextButtons(entry.id, lang.END_CHAT_FORCE, true, false, true, true, false);
    }
  });
};

export default {
  processEvent,
  removeTimeoutUser
};
