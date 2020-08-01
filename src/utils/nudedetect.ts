import fb from './facebook';
import config from '../config';

const isNudeDetect = async (url: string) : Promise<boolean> => {
    const deepai = await require('deepai'); // OR include deepai.min.js as a script tag in your HTML
    let isNude = false;
    await deepai.setApiKey('2800c887-35b8-44eb-9eff-079bb405d430');

    await (async function() {
        var resp = await deepai.callStandardApi("nsfw-detector", {
                image: url,
        });
        console.log(resp);
        var res = JSON.stringify(resp);
        var kq = JSON.parse(res);
        if(kq['output']['nsfw_score'] > 0.5) isNude = true;
    })()
    console.log(isNude);
    return isNude;
}

const isNudeImage = async (url: string) : Promise<boolean> => {
    const sightengine = await require('sightengine')(config.NUDE_API_USER, config.NUDE_API_SECRET);
    let isNude : boolean = false;
    await sightengine.check(['nudity']).set_url(url).then(async function(result: string) {
        var res = JSON.stringify(result);
        var kq = JSON.parse(res);
        if(kq['status'] == 'success'){
             if(kq['nudity']['raw'] >= Math.max(kq['nudity']['safe'], kq['nudity']['partial'])) {
                 isNude = true;
             }
             else if(kq['nudity']['partial'] >= Math.max(kq['nudity']['raw'], kq['nudity']['safe'])) 
             {
                 if(kq['nudity']['partial_tag'] === 'bikini' || kq['nudity']['partial_tag'] === 'lingerie') {
                     isNude = true;
                 }
             }
         }
    }).catch(async function(err: any) {
        console.log(err);
        isNude = true;
    });
    return isNude;
};



const sendImage = async (sender: string, receiver : string, url : string) : Promise<void> => {
   // const isNude = await isNudeImage(url);
    const isNude = await isNudeDetect(url);
    if(!isNude) {
        await fb.sendAttachment(sender, receiver, 'image', url, false, false, true);
    }
    else {
        await fb.sendTextButtonUrl(sender, receiver, 'Đối phương đã gửi nội dung nhạy cảm', url, false);
        await fb.sendTextMessage('', sender, '[BOT]⚠️ Phát hiện nội dung nhạy cảm. \nTài khoản của bạn có thể bị cấm khỏi trang.', false);
        await fb.sendTextButtonUrl(sender, config.DEV_ID, 'Phát hiện ID ' + sender + ' đã gửi ảnh nhạy cảm.', url, false);
    }
}
export default {
    sendImage
  };
  
