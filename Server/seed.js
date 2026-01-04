require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/product');

const products = [
  // --- BATTERS CATEGORY ---
  {
    name: "Idli Batter",
    slug: "idli-batter",
    price: 80,
    category: "Batters",
    description: "Soft & fluffy idli batter, freshly ground.",
    image: "assets/images/idli.jpg",
    isAvailable: true, // Added field
  },
  {
    name: "Dosa Batter",
    slug: "dosa-batter",
    price: 90,
    category: "Batters",
    description: "Crispy dosa batter with authentic taste.",
    image: "assets/images/dosa.jpg",
    isAvailable: true, // Added field
  },
  {
    name: "Paddu Batter",
    slug: "paddu-batter",
    price: 85,
    category: "Batters",
    description: "Perfect paddu (paniyaram) batter.",
    image: "assets/images/paddu.jpg",
    isAvailable: true, // Added field
  },

  // --- BREAKFAST CATEGORY ---
  {
    name: "Idli",
    slug: "breakfast-idli",
    price: 40,
    category: "Breakfast",
    description: "Steam-cooked soft rice cakes served with chutney.",
    image: "assets/images/breakfast-idli.jpg",
    isAvailable: true,
  },
  {
    name: "Plain Dosa",
    slug: "plain-dosa",
    price: 50,
    category: "Breakfast",
    description: "Thin and crispy rice crepe.",
    image: "assets/images/plain-dosa.jpg",
    isAvailable: true,
  },
  {
    name: "Pongal",
    slug: "pongal",
    price: 60,
    category: "Breakfast",
    description: "Traditional South Indian ghee-based lentil and rice dish.",
    image: "assets/images/pongal.jpg",
    isAvailable: true,
  },
  {
    name: "Poori",
    slug: "poori",
    price: 70,
    category: "Breakfast",
    description: "Deep-fried bread served with potato masala.",
    image: "assets/images/poori.jpg",
    isAvailable: true,
  },
  {
    name: "Rice Bath",
    slug: "rice-bath",
    price: 65,
    category: "Breakfast",
    description: "Flavorful spiced rice mixed with vegetables.",
    image: "assets/images/rice-bath.jpg",
    isAvailable: true,
  },
  {
    name: "Masal Dosa",
    slug: "masal-dosa",
    price: 75,
    category: "Breakfast",
    description: "Crispy dosa stuffed with spiced potato filling.",
    image: "assets/images/masal-dosa.jpg",
    isAvailable: true,
  },
  {
    name: "Ghee Podi Dosa",
    slug: "ghee-podi-dosa",
    price: 85,
    category: "Breakfast",
    description: "Dosa topped with spicy lentil powder and pure ghee.",
    image: "assets/images/ghee-podi-dosa.jpg",
    isAvailable: true,
  },

  // --- BRIYANI CATEGORY ---
  {
    name: "Chicken Briyani",
    slug: "chicken-briyani",
    price: 180,
    category: "Briyani",
    description: "Authentic flavorful basmati rice cooked with tender chicken and spices.",
    image: "assets/images/chicken-briyani.jpg",
    isAvailable: true,
  },
  {
    name: "Mutton Briyani",
    slug: "mutton-briyani",
    price: 250,
    category: "Briyani",
    description: "Premium mutton pieces dum-cooked with aromatic spices.",
    image: "assets/images/mutton-briyani.jpg",
    isAvailable: true,
  },
  {
    name: "Chicken 65 Briyani",
    slug: "chicken-65-briyani",
    price: 200,
    category: "Briyani",
    description: "Spicy Chicken 65 pieces layered with aromatic briyani rice.",
    image: "assets/images/c65-briyani.jpg",
    isAvailable: true,
  },
  {
    name: "Chicken Kebab",
    slug: "chicken-kebab",
    price: 150,
    category: "Briyani",
    description: "Deep-fried spicy chicken chunks - perfect as a side for briyani.",
    image: "assets/images/chicken-kebab.jpg",
    isAvailable: true,
  }
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    await Product.deleteMany();
    console.log("Cleared old products");

    await Product.insertMany(products);
    console.log("Inserted new products with availability status");

    mongoose.connection.close();
    console.log("Done!");
  } catch (err) {
    console.error("Error:", err);
  }
}

seedDB();