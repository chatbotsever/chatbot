import { Schema, Document, model } from 'mongoose';
import StateEnum from '../../enums/StateEnum';

const StateSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  state: {
    type: String,
    enum: Object.keys(StateEnum),
    required: true
  }
});

export interface StateProp extends Document {
  id: string;
  state: StateEnum;
}

export default model<StateProp>('state', StateSchema);
