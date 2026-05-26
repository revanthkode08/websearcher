const users = [
  {
    Name: "Admin User",
    Email: "admin@gmail.com",
    Password: "password123",
    Role: "admin"
  },
  {
    Name: "Author User",
    Email: "author@gmail.com",
    Password: "password123",
    Role: "author"
  },
  {
    Name: "Normal User",
    Email: "email@gmail.com",
    Password: "password123",
    Role: "user"
  }
];

async function seed() {
  for (const user of users) {
    try {
      const res = await fetch("http://localhost:5000/app/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
      });
      const data = await res.json();
      console.log(`Registered ${user.Email}:`, data);
    } catch (err) {
      console.error(`Failed to register ${user.Email}:`, err.message);
    }
  }
}

seed();
