# Mongur
Define MongoDB models and query data using Typescript/ES6 classes.


Note: It needs a lot more tests before it's ready for use in production.

## Documentation
[https://mongur.dev](https://mongur.dev)

## Install
```shell
# npm 
npm install mongur --save

# yarn
yarn add mongur

# pnpm
pnpm add mongur
```

## Guides
- [Define your models](https://mongur.dev/models)
- [Write queries](https://mongur.dev/queries)
- [API reference](https://mongur.dev/reference/api)


## Basic Usage

Define your models:

```typescript
import {model, Model} from "mongur"

@model()
export class User extends Model<User>() {

  @field()
  firstName!: string;

  @field()
  lastName!: string;
  
  @field()
  email!: string
  
  @field()
  password?: string

}
```

#### Connect:

```typescript
import {connection, MongoClient} from "mongur";

connection.client = new MongoClient("mongodb://127.0.0.1:27017/mongur", {monitorCommands: true})
await connetion.connect()

```

#### Insert:

```typescript
const user = new User({firstName: "John", lastName: "Doe", email: "john@example.com"})
await user.save()
```

#### Query:

```typescript
const user = await User.find({email: "john@example.com"}).one()
```

#### Update:

```typescript
await User.find({email: "john@example.com"}).update({$set: {email: "john@example.net"}})
```

#### Delete:

```typescript
await User.find({email: "john@example.com"}).delete()
```


## Motivation

```typescript
// Mongoose example
const User = model<IUser>('User', userSchema);
// Typegoose example
const User = getModelForClass(ModelClass);
```
Here, in both cases `User` is not a type, it's a value. Therefore, it cannot be used to specify type in the code.
For example, you cannot define a function like this:

```typescript

function doSomething(user: User) { // Error, 'User' refers to a value, but is being used as a type here

}
```
Many people counter this problem by writing an interface with the same fields (`Declaration Merging`). Others just 
use `any` type instead. `Mongur` solves this problem by defining schema using pure class and using the same class for
querying data.

