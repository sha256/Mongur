import {MongoClient} from "mongodb";
import {kModelIndexes} from "./constant";
import {ModelMeta} from "./common";


export class Connection {

  private _client?: MongoClient
  private _isConnected = false
  private _indexQueue: any[] = []

  constructor(client?: MongoClient) {
    if (client){
      this.client = client
    }
  }

  set client(client: MongoClient){
    this._client = client
    client.on("connectionReady", () => {
      this._isConnected = true
      this.processIndexQueue()
    })
    client.on("connectionClosed", () => {
    })
  }

  get client(): MongoClient {
    return this._client!
  }

  queueIndex(meta: ModelMeta, klass: any){
    if (!this._isConnected){
      this._indexQueue.push({meta, klass})
      return
    }
    this.processIndex(meta, klass)
  }

  private processIndexQueue(){
    while (this._indexQueue.length > 0){
      const {meta, klass} = this._indexQueue.shift()
      this.processIndex(meta, klass)
    }
  }

  private processIndex(meta: ModelMeta, klass: any){
    const indexes = Reflect.getMetadata(kModelIndexes, klass) || []
    for (let {fields, options} of indexes){
      this.client.db().collection(meta.collectionName).createIndex(fields, options).catch((e) => {
        //console.log(e)
      })
    }
  }

  async connect(): Promise<MongoClient> {
    const client = await this.client.connect()
    return client
  }

  async disconnect() {
    return this.client?.close()
  }

}

export const connection = new Connection()