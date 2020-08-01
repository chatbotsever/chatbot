import GenderEnum from '../enums/GenderEnum';
import StateEnum from '../enums/StateEnum';
export interface ChatRoomEntry {
  id1: string;
  id2: string;
  gender1: GenderEnum;
  gender2: GenderEnum;
  time: Date;
}

export interface WaitRoomEntry {
  id: string;
  gender: GenderEnum;
  time: Date;
}

export interface GenderEntry {
  id: string;
  gender: GenderEnum;
}

export interface LastPersonEntry {
  id1: string;
  id2: string;
}

export interface StateEntry
{
  id: string;
  state: StateEnum;
}
