const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');
const Class = require('./models/Class');

mongoose.connect('mongodb://localhost:27017/erpp').then(async () => {
  // Create a class
  const class1 = new Class({ name: 'Grade 10', section: 'A', academicYear: '2024-2025' });
  await class1.save();

  // Create a student
  const student = new Student({
    name: 'Nitish Kumar', rollNumber: 'S101', email: 's@test.com', phone: '1234567890', class: class1._id,
    attendance: [
      { date: new Date('2024-03-01'), status: 'Present' },
      { date: new Date('2024-03-02'), status: 'Absent' },
      { date: new Date('2024-03-03'), status: 'Present' }
    ]
  });
  await student.save();

  // Create user for student
  const user = new User({ username: 'student', password: 'password', role: 'student', profile: student._id, profileModel: 'Student' });
  await user.save();

  console.log('Seeded student and demo data');
  process.exit(0);
}).catch(e => {
  console.log(e); process.exit(1);
});
