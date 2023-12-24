import {MongoClient, MongoClientOptions} from "mongodb";
import {kModelIndexes} from "./constant";

export class ModelMeta {

  constructor(
    public readonly collectionName: string,
    public readonly modelClassName: string,
  ) {}

}

export class Connection {

  private _client?: MongoClient
  private _isConnected = false
  private _indexQueue: any[] = []

  async connect(url: string, options?: MongoClientOptions): Promise<MongoClient> {
    return this._connect(new MongoClient(url, options))
  }

  private async _connect(client: MongoClient){
    this._client = client
    client.on("connectionReady", () => {
      this._isConnected = true
      this.processIndexQueue()
    })

    client.on("connectionClosed", () => {
      this._isConnected = false
    })

    client.on("commandStarted", (eventName) => {
      //console.log(JSON.stringify(eventName, null, 2))
    })
    return client.connect()
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

  async disconnect() {
    return this.client?.close()
  }

}

export const connection = new Connection()