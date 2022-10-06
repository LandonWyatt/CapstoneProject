const mongoose = require('mongoose');
const uri = "mongodb+srv://Landon:Password@cluster0.ficfd.mongodb.net/capstoneDatabase?retryWrites=true&w=majority";

// Create DB model
let dbSchema = mongoose.Schema({ name: String, chipCount: Number });
// Singular name of collection, pluralized in DB
let collectionName = 'testUserInformation';
let DBModel = mongoose.model('testUserInformation', dbSchema, collectionName);
module.exports = DBModel;

// Create connection to database
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch(err => console.log(`Initial connection error: ${err}`));
const db = mongoose.connection;
db
    .once('open', () => { console.log('Database initial connection complete'); })
    .on('error', (err) => {
        console.log('Connection error');
        console.log(err);
    })
    .on('disconnected', () => { console.log('Disconnected from server'); })
    .on('reconnected', () => { console.log('Reconnected to server'); })
    .on('reconnectFailed', () => { console.log('Failed to reconnect'); });

test('Check the application can find a user.', async () => {
    var name = "User1";
    // Find document in DB containing name equal to User1
    var findName = await DBModel.find({}).where('name').equals(name).exec();
    // Check that correct information is found
    expect(findName[0].name).toBe("User1");
    expect(findName[0].chipCount).toBe(800);
})

test('Check the application can update a user.', async () => {
    var name = "User1";
    // Find document in DB containing name = User1
    var findName = await DBModel.find({}).where('name').equals(name).exec();
    // Make sure we know the initial information
    expect(findName[0].name).toBe("User1");
    expect(findName[0].chipCount).toBe(800);

    // Set chipCount = 300 in this document
    var findName = await DBModel.findOneAndUpdate({}, { chipCount: 300 }, { new: true, useFindAndModify: true }).where('name').equals(name);
    // Check that the chipCount has changed
    expect(findName.name).toBe("User1");
    expect(findName.chipCount).toBe(300);
    // Change chipCount to original value
    await DBModel.findOneAndUpdate({}, { chipCount: 800 }, { new: true, useFindAndModify: true }).where('name').equals(name);
})

test('Check the application can add a user.', async () => {
    var name = "User2";
    // Create user with name: "User2" and chipCount: 1000
    await DBModel.create({ name: name, chipCount: 1000 });
    // Check that information was added to DB
    var findName = await DBModel.find({}).where('name').equals(name).exec();
    expect(findName[0].name).toBe("User2");
    expect(findName[0].chipCount).toBe(1000);
    // Delete User2
    await DBModel.deleteOne({ name: name, chipCount: 1000 });
    // Close DB
    await db.close();
})