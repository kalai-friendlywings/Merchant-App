// import React, { useState } from 'react';
// import AllProducts from './Products/AllProducts';
// import SmartAddProduct from './Products/SmartAddProduct';
// // import ExcelUpload from './ExcelUpload'; // Optional for future

// const Products = () => {
//   const [activeTab, setActiveTab] = useState('all');

//   const tabs = [
//     { key: 'all', label: 'All Products' },
//     { key: 'smart', label: 'Smart Add Product' },
//     // { key: 'excel', label: 'Upload via Excel' }, // Future
//   ];

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case 'all':
//         return <AllProducts />;
//       case 'smart':
//         return <SmartAddProduct />;
//       // case 'excel':
//       //   return <ExcelUpload />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="p-6">
//       <div className="flex space-x-4 mb-6">
//         {tabs.map((tab) => (
//           <button
//             key={tab.key}
//             onClick={() => setActiveTab(tab.key)}
//             className={`px-4 py-2 rounded ${
//               activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
//             }`}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>
//       <div>{renderTabContent()}</div>
//     </div>
//   );
// };

// export default Products;
