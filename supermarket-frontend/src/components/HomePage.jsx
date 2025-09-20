// import React from 'react';
// import RotatingText from './RotatingText';
// import CategoryFilters from './CategoryFilters';
// import ProductList from './ProductList';

// const HomePage = ({
//   addToCart,
//   searchTerm,
//   selectedCategory,
//   onCategorySelect,
//   categories
// }) => (
//   <>
//     <section className="hero-section">
//       <div className="hero-card">
//         <h1 className="hero-title">
//           <RotatingText
//             texts={[
//               "🛒 Προσφορές της Εβδομάδας",
//               "🚀 Άμεση Παράδοση",
//               "🥬 Φρέσκα Λαχανικά",
//               "🍩 Γλυκά για Όλους",
//               "🇬🇷 Τοπικά Προϊόντα",
//               "💰 Οικονομία κάθε μέρα"
//             ]}
//             splitBy="characters"
//             staggerDuration={0.06}
//             rotationInterval={4000}
//             transition={{ type: "tween", duration: 1.2, ease: "easeInOut" }}
//             mainClassName="hero-rotating-text"
//           />
//         </h1>
//       </div>
//     </section>

//     <CategoryFilters
//       categories={categories}
//       active={selectedCategory}
//       onSelect={onCategorySelect}
//     />

//     <ProductList
//       addToCart={addToCart}
//       searchTerm={searchTerm}
//       category={selectedCategory}
//     />
//   </>
// );

// export default HomePage;
