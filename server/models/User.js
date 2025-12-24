import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /@.+\.(ac\.in|edu)$/ // allow campus emails
    },
    password: { type: String, required: true },
    college: { type: String, required: true },
    department: String,
    hostel: String,
    avatarUrl: String,
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }]
  },
  { timestamps: true }
);

// simple compare: if later we store plain text, this is just ==
// once hashing is re-added, this will still work
userSchema.methods.matchPassword = function (enteredPassword) {
  // if you’ve not hashed yet, use simple equality
  return Promise.resolve(enteredPassword === this.password);
};

const User = mongoose.model("User", userSchema);
export default User;


// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       // simple: must end with ac.in or edu
//       match: /@.+\.(ac\.in|edu)$/ 
//     },
//     password: { type: String, required: true },
//     college: { type: String, required: true },
//     department: String,
//     hostel: String,
//     avatarUrl: String,
//     wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }]
//   },
//   { timestamps: true }
// );

// // clean async pre-save hook
// userSchema.pre("save", async function (next) {
//   try {
//     if (!this.isModified("password")) return next();

//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     return next();
//   } catch (err) {
//     return next(err);
//   }
// });

// userSchema.methods.matchPassword = function (enteredPassword) {
//   return bcrypt.compare(enteredPassword, this.password);
// };

// const User = mongoose.model("User", userSchema);
// export default User;

