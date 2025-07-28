import { motion } from "framer-motion";

function Navbar() {
  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-purple-700 p-4 shadow-lg"
    >
      <h1 className="text-white text-2xl font-bold">📚 Book App</h1>
    </motion.nav>
  );
}

export default Navbar;
