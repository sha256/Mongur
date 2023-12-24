import {ObjectId} from "mongodb";
import {PopulateOption} from "../types";
import {kFieldPropertiesMeta} from "../constant";
import {PropertiesMeta} from "../field";

/**
 * obj.<ref>
 * obj.[ref]
 * obj.[any].<ref>
 *  lists: [{item: }]
 * obj.[any].[ref]
 * obj.{key: <ref>}
 */

export async function doPopulate(model: any, objects: any[], populate: PopulateOption){

  const segments = populate.path.split('.')
  const base = segments.slice(0, -1)
  const property = segments[segments.length-1]

  let metadata: PropertiesMeta
  let targets = objects
  let parentModel = model

  for (let i = 0; i < segments.length; i++){
    const segment = segments[i]
    metadata = Reflect.getMetadata(kFieldPropertiesMeta, parentModel) || {}
    parentModel = metadata[segment].options.type
    const isArray = metadata[segment].isArray
    if (i != segments.length - 1){
      if (isArray){
        let newTargets: any[] = []
        for (let target of targets){
          newTargets = newTargets.concat(target[segment])
        }
        targets = newTargets
      } else {
        targets = targets.map(t => t[segment])
      }
    }
  }

  const objectIds: ObjectId[] = []
  const objectIdMap: {[objectId: string]: Set<any>} = {}

  if (metadata![property].isArray){
    for(let target of targets){
      for(let item of target[property]){
        if (objectIdMap[item.toString()]){
          objectIdMap[item.toString()].add(target)
        } else {
          objectIdMap[item.toString()] = new Set([target])
        }
        objectIds.push(item)
      }
      target[property] = []
    }
  } else {
    for(let target of targets){
      if (objectIdMap[target[property].toString()]){
        objectIdMap[target[property].toString()].add(target)
      } else {
        objectIdMap[target[property].toString()] = new Set([target])
      }
      objectIds.push(target[property])
    }
  }


  const fetchedObjects: any[] = await parentModel.find({_id: {$in: objectIds}})
  for (let ob of fetchedObjects){
    const targets = objectIdMap[ob._id.toString()]
    if (targets){
      for (let target of targets){
        if (metadata![property].isArray){
          target[property].push(ob)
        } else {
          target[property] = ob
        }
      }
    }
  }

  if (populate.populate){
    await doPopulate(parentModel, fetchedObjects, populate.populate)
  }
}