import mongoose from "mongoose";

const MONGO_URI = "mongodb://localhost:27017";

const connectToMongo = async () => {
  try {
    const { connection } = await mongoose.connect(MONGO_URI);
    if (connection) console.log(`connected to mongoDB: ${connection.host}`);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

export default connectToMongo;
