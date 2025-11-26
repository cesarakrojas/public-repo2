import * as inventoryService from '../services/inventoryService';
import * as dataService from '../services/dataService';

export const populateSampleData = async () => {
  // Check if data already exists
  const existingProducts = await inventoryService.getAllProducts();
  if (existingProducts.length > 0) {
    console.log('Sample data already exists');
    return;
  }

  // Sample products with real images
  const products = [
    {
      name: 'Pantalón Casual',
      description: 'Pantalón casual de corte moderno, perfecto para uso diario',
      price: 45.00,
      category: 'Ropa',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6VlMP8P7srvZcYbnijxXFhW_Xjpyi0-uPuHeLMMSRSAB9DZoPVqCPe4VCU_kNBOHkXoXJM0lfyzgZtD5nne6EDaP2sdjXJts-Jy5VecKzDam8xy7QGOTB5zMlk9K_O6gIra-wCAT8O20cucCV22Y1IHTvkdUWuo6rQGAj_JWAzjTxkn_mOICWAGDPCRMpcdNVA6_l749AJXzUVz813Q7CU2AdAFiRVujZC2wn14zHwkjg5EOFIGXI8PQEzLM4ETAqxJg7vALej7kw',
      hasVariants: true,
      variants: [
        { name: 'S ', quantity: 15, sku: 'PANT-S-AZ' },
        { name: 'M ', quantity: 20, sku: 'PANT-M-AZ' },
        { name: 'L ', quantity: 12, sku: 'PANT-L-AZ' }
      ]
    },
    {
      name: 'Camiseta Estampada',
      description: 'Camiseta de algodón con estampado único y diseño moderno',
      price: 25.00,
      category: 'Ropa',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHmnPt7WLucgX3rPQKxtcLQyJl5p5xGB8wpFfBIGdlnvRDJkid9cba7mHg361ualSkmLxkud6Nc3N6rCA5G6BswG0RDeXc3oJYgNzPYYE01Rr_gbipq5YPk5VHgdON5Ja6zLuehhWHZe8vuxYbT_jLmLJvAePHQr3rnf3N0IvmjentbqZdmZu6eCP0kzGz2GT9-_zg2Eyap31OxPE-w5835W7nmg-QdMMIvnYghWgjWgGpcYN8VcqMP5ftoHLo_ZIf6AJcAg0acKJv',
      hasVariants: true,
      variants: [
        { name: 'S ', quantity: 25, sku: 'CAM-S-BL' },
        { name: 'M ', quantity: 30, sku: 'CAM-M-BL' },
        { name: 'L ', quantity: 18, sku: 'CAM-L-BL' }
      ]
    },
    {
      name: 'Zapatillas Deportivas',
      description: 'Zapatillas cómodas y elegantes para deportes y uso casual',
      price: 65.00,
      category: 'Calzado',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlSDcDL0uoKtI9nv0iVWAQsRIaNuu75k2DafttNj2W3IfwVVQiLK62FNsNSP0QNcrLk8UAeQth25oR3MmQ2D3r4oRQfZNks1K5fS4MGzi6reW4LtnzSrh6Gy3LFmGzqYo4ITJHJ4E0q-Rj5jiP1T2D523Apq29CxFRzEdc_OlSgFPvotniMwD0aTL8UifkttdUalvhYhOorlxZKwsEh3WwBUV56a5BsIaQrfhgGdRk_fNwtU6NJTsGxPl3SapSHc7zoikCKzFXsRoQ',
      hasVariants: true,
      variants: [
        { name: '39 ', quantity: 8, sku: 'ZAP-39-BL' },
        { name: '40 ', quantity: 10, sku: 'ZAP-40-BL' },
        { name: '41 ', quantity: 12, sku: 'ZAP-41-BL' },
        { name: '42 ', quantity: 9, sku: 'ZAP-42-BL' }
      ]
    },
    {
      name: 'Chaqueta Urbana',
      description: 'Chaqueta versátil para todo tipo de clima, estilo urbano moderno',
      price: 85.00,
      category: 'Ropa',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDr1RXzAec7D1BWQNRiGAoy6l-3KPGcbxD8dYnbkkx-hpudcrAn7FW60x-UxYtY3Mgdx5GrhL9_fYuByPfmRc6DY_h6Mlm-4LVeGLBm9uMCaHlzTNp8_j_F3IleBZmkilo_7POI9cxCQRQS8YVnIoqIkQXHDeuL0rjRiIfen4_MITLEF-Za3mpGK2DDqdNa3uluDeraAfcS7QYX8vy1X3UoxPJiHhhQdP2CS1F7b90LSxTI27hKuTxT_6XbZNXvYycVESiqm8Ra7nWr',
      hasVariants: true,
      variants: [
        { name: 'S ', quantity: 6, sku: 'CHAQ-S-NE' },
        { name: 'M ', quantity: 8, sku: 'CHAQ-M-NE' },
        { name: 'L ', quantity: 5, sku: 'CHAQ-L-NE' }
      ]
    },

  ];

  // Create products
  console.log('Creating products...');
  for (const product of products) {
    await inventoryService.createProduct(
      product.name,
      product.price,
      product.description,
      product.image,
      product.category,
      product.hasVariants,
      product.variants,
      0
    );
  }

  // Get created product IDs (we'll need these for items)
  const createdProducts = await inventoryService.getAllProducts();
  const camiseta = createdProducts.find(p => p.name === 'Camiseta Estampada');
  const zapatillas = createdProducts.find(p => p.name === 'Zapatillas Deportivas');
  const pantalon = createdProducts.find(p => p.name === 'Pantalón Casual');
  const chaqueta = createdProducts.find(p => p.name === 'Chaqueta Urbana');

  // Sample transactions
  const transactions = [
    // Ventas (últimos días) - with product items
    { 
      type: 'inflow' as const, 
      description: 'Venta: Camiseta Estampada x2', 
      amount: 50.00, 
      category: 'Ventas', 
      paymentMethod: 'Efectivo', 
      daysAgo: 0,
      items: camiseta ? [{ productId: camiseta.id, productName: 'Camiseta Estampada', quantity: 2, variantName: 'M', price: 25.00 }] : undefined
    },
    { 
      type: 'inflow' as const, 
      description: 'Venta: Zapatillas Deportivas', 
      amount: 65.00, 
      category: 'Ventas', 
      paymentMethod: 'Tarjeta', 
      daysAgo: 0,
      items: zapatillas ? [{ productId: zapatillas.id, productName: 'Zapatillas Deportivas', quantity: 1, variantName: '42', price: 65.00 }] : undefined
    },
    { 
      type: 'inflow' as const, 
      description: 'Venta: Pantalón Casual', 
      amount: 45.00, 
      category: 'Ventas', 
      paymentMethod: 'Transferencia', 
      daysAgo: 1,
      items: pantalon ? [{ productId: pantalon.id, productName: 'Pantalón Casual', quantity: 1, variantName: 'L', price: 45.00 }] : undefined
    },
    { 
      type: 'inflow' as const, 
      description: 'Venta: 2 productos', 
      amount: 90.00, 
      category: 'Ventas', 
      paymentMethod: 'Efectivo', 
      daysAgo: 1,
      items: camiseta && pantalon ? [
        { productId: camiseta.id, productName: 'Camiseta Estampada', quantity: 1, variantName: 'S', price: 25.00 },
        { productId: pantalon.id, productName: 'Pantalón Casual', quantity: 1, variantName: 'M', price: 45.00 }
      ] : undefined
    },
    { 
      type: 'inflow' as const, 
      description: 'Venta: Chaqueta Urbana', 
      amount: 85.00, 
      category: 'Ventas', 
      paymentMethod: 'Tarjeta', 
      daysAgo: 2,
      items: chaqueta ? [{ productId: chaqueta.id, productName: 'Chaqueta Urbana', quantity: 1, variantName: 'M', price: 85.00 }] : undefined
    },
    { 
      type: 'inflow' as const, 
      description: 'Venta: 3 productos', 
      amount: 135.00, 
      category: 'Ventas', 
      paymentMethod: 'Efectivo', 
      daysAgo: 2,
      items: camiseta && pantalon && zapatillas ? [
        { productId: camiseta.id, productName: 'Camiseta Estampada', quantity: 1, variantName: 'L', price: 25.00 },
        { productId: pantalon.id, productName: 'Pantalón Casual', quantity: 1, variantName: 'S', price: 45.00 },
        { productId: zapatillas.id, productName: 'Zapatillas Deportivas', quantity: 1, variantName: '40', price: 65.00 }
      ] : undefined
    },
    { 
      type: 'inflow' as const, 
      description: 'Venta: Zapatillas Deportivas x2', 
      amount: 130.00, 
      category: 'Ventas', 
      paymentMethod: 'Transferencia', 
      daysAgo: 3,
      items: zapatillas ? [{ productId: zapatillas.id, productName: 'Zapatillas Deportivas', quantity: 2, variantName: '41', price: 65.00 }] : undefined
    },
    { 
      type: 'inflow' as const, 
      description: 'Venta: 2 productos', 
      amount: 110.00, 
      category: 'Ventas', 
      paymentMethod: 'Efectivo', 
      daysAgo: 3,
      items: camiseta && chaqueta ? [
        { productId: camiseta.id, productName: 'Camiseta Estampada', quantity: 1, variantName: 'M', price: 25.00 },
        { productId: chaqueta.id, productName: 'Chaqueta Urbana', quantity: 1, variantName: 'L', price: 85.00 }
      ] : undefined
    },
    
    // Gastos
    { type: 'outflow' as const, description: 'Compra de inventario textil', amount: 320.00, category: 'Gastos Operativos', paymentMethod: 'Transferencia', daysAgo: 4 },
    { type: 'outflow' as const, description: 'Pago de alquiler del local', amount: 450.00, category: 'Gastos Operativos', paymentMethod: 'Transferencia', daysAgo: 5 },
    { type: 'outflow' as const, description: 'Material de embalaje', amount: 65.00, category: 'Suministros', paymentMethod: 'Efectivo', daysAgo: 6 },
    { type: 'outflow' as const, description: 'Servicios de luz y agua', amount: 89.00, category: 'Servicios Públicos', paymentMethod: 'Transferencia', daysAgo: 7 },
    { type: 'outflow' as const, description: 'Publicidad en redes sociales', amount: 120.00, category: 'Otros Gastos', paymentMethod: 'Tarjeta', daysAgo: 8 }
  ];

  // Create transactions with adjusted timestamps
  console.log('Creating transactions...');
  for (const transaction of transactions) {
    const newTx = await dataService.addTransaction(
      transaction.type,
      transaction.description,
      transaction.amount,
      transaction.category,
      transaction.paymentMethod,
      transaction.items
    );
    
    // Manually adjust timestamp after creation
    const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const txIndex = allTransactions.findIndex((t: any) => t.id === newTx.id);
    if (txIndex !== -1) {
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - transaction.daysAgo);
      timestamp.setHours(timestamp.getHours() - Math.floor(Math.random() * 8));
      allTransactions[txIndex].timestamp = timestamp.toISOString();
      localStorage.setItem('transactions', JSON.stringify(allTransactions));
    }
  }

  // Sample debts
  const debts = [
    // Por Cobrar (Receivables)
    {
      type: 'receivable' as const,
      counterparty: 'Boutique La Moda',
      amount: 450.00,
      description: 'Venta al por mayor - 15 prendas varias',
      daysFromNow: 15,
      category: 'Ventas Mayoristas',
      notes: 'Cliente habitual, excelente historial de pago'
    },
    {
      type: 'receivable' as const,
      counterparty: 'María González',
      amount: 135.00,
      description: 'Chaqueta Urbana y Pantalón Casual',
      daysFromNow: -5, // Overdue
      category: 'Ventas Minoristas',
      notes: 'Llamar para recordar el pago'
    },
    {
      type: 'receivable' as const,
      counterparty: 'Tienda Centro Comercial',
      amount: 890.00,
      description: 'Pedido especial - Colección primavera',
      daysFromNow: 30,
      category: 'Ventas Mayoristas',
      notes: 'Pago programado para fin de mes'
    },
    
    // Por Pagar (Payables)
    {
      type: 'payable' as const,
      counterparty: 'Textiles del Norte S.A.',
      amount: 1200.00,
      description: 'Compra de telas y materiales',
      daysFromNow: 10,
      category: 'Proveedores',
      notes: 'Proveedor principal de telas'
    },
    {
      type: 'payable' as const,
      counterparty: 'Inmobiliaria Torres',
      amount: 450.00,
      description: 'Alquiler del local - Mes actual',
      daysFromNow: 5,
      category: 'Gastos Operativos',
      notes: 'Pago mensual recurrente'
    },
    {
      type: 'payable' as const,
      counterparty: 'Distribuidora Fashion',
      amount: 680.00,
      description: 'Calzado deportivo - 10 pares',
      daysFromNow: -3, // Overdue
      category: 'Proveedores',
      notes: 'Urgente: Contactar para programar pago'
    },
    {
      type: 'payable' as const,
      counterparty: 'Servicios Gráficos Express',
      amount: 150.00,
      description: 'Diseño y impresión de etiquetas',
      daysFromNow: 20,
      category: 'Otros Gastos',
      notes: 'Etiquetas para nueva colección'
    }
  ];

  // Import debtService dynamically
  const debtService = await import('../services/debtService');

  // Create debts
  console.log('Creating debts...');
  for (const debt of debts) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + debt.daysFromNow);
    
    await debtService.createDebt(
      debt.type,
      debt.counterparty,
      debt.amount,
      debt.description,
      dueDate.toISOString().split('T')[0],
      debt.category,
      debt.notes
    );
  }

  console.log('Sample data populated successfully!');
};
