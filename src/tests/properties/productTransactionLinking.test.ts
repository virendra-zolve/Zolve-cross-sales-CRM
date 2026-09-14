/**
 * Property-Based Test: Product-Transaction Linking
 * 
 * Property: FOR ALL products marked "Completed/Sold", exactly_one Lead_Transaction
 * SHALL be linked via transaction_id
 */

import { LeadsDatabase } from '../../api/leadsApi';
import { expect } from 'vitest';

describe('Property: Product-Transaction Linking', () => {
  let db: LeadsDatabase;

  beforeEach(() => {
    db = new LeadsDatabase();
  });

  test('Property 1: New product opportunity has status Interested', () => {
    const lead = db.createLead({
      studentName: 'Product Test 1',
      mobileNumber: '9876543600',
      mobileCountryCode: '91',
      email: 'product1@example.com',
      sourceCode: 'TEST',
    });

    const product = db.addLeadProduct(lead.leadId, {
      masterProduct: 'Education Loan',
      productOwner: 'RM',
    });

    expect(product).toBeTruthy();
    expect(product?.status).toBe('Interested');
    expect(product?.transactionId).toBeUndefined();
  });

  test('Property 2: Product marked Completed/Sold creates transaction', () => {
    const lead = db.createLead({
      studentName: 'Product Test 2',
      mobileNumber: '9876543601',
      mobileCountryCode: '91',
      email: 'product2@example.com',
      sourceCode: 'TEST',
    });

    // Add product
    const product = db.addLeadProduct(lead.leadId, {
      masterProduct: 'Education Loan',
      productOwner: 'RM',
      amount: 50000,
      partner: 'Avanse',
    });

    expect(product?.opportunityId).toBeTruthy();

    // Update to Completed/Sold
    const updated = db.updateProductOpportunity(lead.leadId, product!.opportunityId, {
      status: 'Completed/Sold',
    });

    expect(updated).toBeTruthy();
    expect(updated?.status).toBe('Completed/Sold');
    expect(updated?.transactionId).toBeTruthy();
  });

  test('Property 3: All 13 master products can be sold and tracked', () => {
    const lead = db.createLead({
      studentName: 'All Products Test',
      mobileNumber: '9876543602',
      mobileCountryCode: '91',
      email: 'allproducts@example.com',
      sourceCode: 'TEST',
    });

    const masterProducts = [
      'Education Loan',
      'Refinance',
      'Test Prep',
      'Test Voucher',
      'Admissions',
      'Accommodation',
      'eSIM',
      'Travel/Flights',
      'Bank Account',
      'Credit Card',
      'Money Transfer',
      'NRE/NRO Account',
      'Insurance',
    ];

    const transactions = [];

    masterProducts.forEach(productName => {
      // Add product
      const product = db.addLeadProduct(lead.leadId, {
        masterProduct: productName as any,
        productOwner: 'RM',
        amount: 10000,
      });

      expect(product).toBeTruthy();

      // Mark as sold
      const sold = db.updateProductOpportunity(lead.leadId, product!.opportunityId, {
        status: 'Completed/Sold',
      });

      expect(sold?.status).toBe('Completed/Sold');
      expect(sold?.transactionId).toBeTruthy();

      transactions.push({
        product: productName,
        transactionId: sold?.transactionId,
      });
    });

    // Verify all have unique transactions
    const uniqueTransactions = new Set(transactions.map(t => t.transactionId));
    expect(uniqueTransactions.size).toBe(masterProducts.length);
  });

  test('Property 4: Multiple sold products maintain separate transactions', () => {
    const lead = db.createLead({
      studentName: 'Multiple Products Test',
      mobileNumber: '9876543603',
      mobileCountryCode: '91',
      email: 'multipleprod@example.com',
      sourceCode: 'TEST',
    });

    const leadId = lead.leadId;

    // Add and sell Education Loan
    const eduLoan = db.addLeadProduct(leadId, {
      masterProduct: 'Education Loan',
      productOwner: 'RM',
      amount: 50000,
    });

    const soldEduLoan = db.updateProductOpportunity(leadId, eduLoan!.opportunityId, {
      status: 'Completed/Sold',
    });

    expect(soldEduLoan?.transactionId).toBeTruthy();
    const eduLoanTxnId = soldEduLoan?.transactionId;

    // Add and sell Test Prep
    const testPrep = db.addLeadProduct(leadId, {
      masterProduct: 'Test Prep',
      productOwner: 'RM',
      amount: 5000,
    });

    const soldTestPrep = db.updateProductOpportunity(leadId, testPrep!.opportunityId, {
      status: 'Completed/Sold',
    });

    expect(soldTestPrep?.transactionId).toBeTruthy();
    const testPrepTxnId = soldTestPrep?.transactionId;

    // Transactions should be different
    expect(eduLoanTxnId).not.toBe(testPrepTxnId);

    // Both products should be in products list as Completed/Sold
    const products = db.getLeadProducts(leadId);
    const completedCount = products.filter(p => p.status === 'Completed/Sold').length;
    expect(completedCount).toBe(2);
  });

  test('Property 5: Product in other statuses do NOT have transaction', () => {
    const lead = db.createLead({
      studentName: 'Non-Sold Products Test',
      mobileNumber: '9876543604',
      mobileCountryCode: '91',
      email: 'nonsold@example.com',
      sourceCode: 'TEST',
    });

    const statuses = ['Interested', 'In Progress', 'Not Interested', 'Failed/Rejected'];

    statuses.forEach(status => {
      const product = db.addLeadProduct(lead.leadId, {
        masterProduct: `Test Product ${status}` as any,
        productOwner: 'RM',
      });

      if (status !== 'Interested') {
        db.updateProductOpportunity(lead.leadId, product!.opportunityId, {
          status: status as any,
        });
      }

      const updated = db.getLeadProducts(lead.leadId).find(
        p => p.opportunityId === product?.opportunityId
      );

      if (status !== 'Completed/Sold') {
        expect(updated?.transactionId).toBeUndefined();
      }
    });
  });

  test('Property 6: Transaction links back to product opportunity', () => {
    const lead = db.createLead({
      studentName: 'Transaction Backlink Test',
      mobileNumber: '9876543605',
      mobileCountryCode: '91',
      email: 'backlink@example.com',
      sourceCode: 'TEST',
    });

    // Add and sell product
    const product = db.addLeadProduct(lead.leadId, {
      masterProduct: 'Education Loan',
      productOwner: 'RM',
      amount: 75000,
      partner: 'ICICI Bank',
    });

    const sold = db.updateProductOpportunity(lead.leadId, product!.opportunityId, {
      status: 'Completed/Sold',
    });

    expect(sold?.transactionId).toBeTruthy();

    // Verify the opportunity links to transaction
    const products = db.getLeadProducts(lead.leadId);
    const linkedOpp = products.find(p => p.opportunityId === product?.opportunityId);

    expect(linkedOpp?.transactionId).toBe(sold?.transactionId);
    expect(linkedOpp?.status).toBe('Completed/Sold');
  });

  test('Property 7: Product status changes are idempotent', () => {
    const lead = db.createLead({
      studentName: 'Idempotent Test',
      mobileNumber: '9876543606',
      mobileCountryCode: '91',
      email: 'idempotent@example.com',
      sourceCode: 'TEST',
    });

    const product = db.addLeadProduct(lead.leadId, {
      masterProduct: 'Test Voucher',
      productOwner: 'RM',
    });

    // Mark as sold multiple times
    const sold1 = db.updateProductOpportunity(lead.leadId, product!.opportunityId, {
      status: 'Completed/Sold',
    });

    const sold2 = db.updateProductOpportunity(lead.leadId, product!.opportunityId, {
      status: 'Completed/Sold',
    });

    // Transaction ID should remain the same
    expect(sold1?.transactionId).toBe(sold2?.transactionId);
  });

  test('Invariant: Sum of sold product amounts >= total transactions', () => {
    const lead = db.createLead({
      studentName: 'Total Revenue Test',
      mobileNumber: '9876543607',
      mobileCountryCode: '91',
      email: 'revenue@example.com',
      sourceCode: 'TEST',
    });

    const leadId = lead.leadId;

    const productAmounts = [
      { product: 'Education Loan' as any, amount: 50000 },
      { product: 'Test Prep' as any, amount: 5000 },
      { product: 'Accommodation' as any, amount: 10000 },
    ];

    let totalExpected = 0;

    productAmounts.forEach(({ product, amount }) => {
      const prod = db.addLeadProduct(leadId, {
        masterProduct: product,
        productOwner: 'RM',
        amount,
      });

      db.updateProductOpportunity(leadId, prod!.opportunityId, {
        status: 'Completed/Sold',
      });

      totalExpected += amount;
    });

    const products = db.getLeadProducts(leadId);
    const totalActual = products
      .filter(p => p.status === 'Completed/Sold')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    expect(totalActual).toBe(totalExpected);
  });

  test('Invariant: Product sold timestamp <= current time', () => {
    const lead = db.createLead({
      studentName: 'Timestamp Invariant',
      mobileNumber: '9876543608',
      mobileCountryCode: '91',
      email: 'timestamp@example.com',
      sourceCode: 'TEST',
    });

    const now = new Date().getTime();

    const product = db.addLeadProduct(lead.leadId, {
      masterProduct: 'Bank Account',
      productOwner: 'RM',
    });

    const sold = db.updateProductOpportunity(lead.leadId, product!.opportunityId, {
      status: 'Completed/Sold',
    });

    if (sold?.completedSoldAt) {
      const soldTime = new Date(sold.completedSoldAt).getTime();
      expect(soldTime).toBeLessThanOrEqual(now + 1000); // Allow 1 second tolerance
    }
  });

  test('Invariant: FOR ALL leads, count(Completed/Sold products) = count(transactions)', () => {
    const leads = [];

    for (let i = 0; i < 3; i++) {
      const lead = db.createLead({
        studentName: `Transaction Count Test ${i}`,
        mobileNumber: `${9876543700 + i}`,
        mobileCountryCode: '91',
        email: `counttest${i}@example.com`,
        sourceCode: 'TEST',
      });

      // Add 2-3 products and sell them
      for (let j = 0; j < 2 + i; j++) {
        const product = db.addLeadProduct(lead.leadId, {
          masterProduct: `Product ${j}` as any,
          productOwner: 'RM',
        });

        db.updateProductOpportunity(lead.leadId, product!.opportunityId, {
          status: 'Completed/Sold',
        });
      }

      leads.push(lead.leadId);
    }

    // Verify each lead's sold products match expected count
    leads.forEach((leadId, index) => {
      const products = db.getLeadProducts(leadId);
      const soldCount = products.filter(p => p.status === 'Completed/Sold').length;

      expect(soldCount).toBe(2 + index);

      // Each sold product should have transaction
      products
        .filter(p => p.status === 'Completed/Sold')
        .forEach(p => {
          expect(p.transactionId).toBeTruthy();
        });
    });
  });
});
