import { TaxService } from "../services";

/**
 * Script to seed default system taxes
 * Run this script to create the default tax types (VAT, NHIS, COVID Levy, GETFUND)
 */
const seedDefaultTaxes = async () => {
  try {
    console.log("🌱 Starting to seed default taxes...");
    
    const defaultTaxes = await TaxService.createDefaultTaxes();
    
    console.log(`✅ Successfully created ${defaultTaxes.length} default taxes:`);
    defaultTaxes.forEach(tax => {
      console.log(`   - ${tax.name}: ${(tax.rate * 100).toFixed(1)}% (Priority: ${tax.priority})`);
    });
    
    console.log("🎉 Default taxes seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding default taxes:", error);
    process.exit(1);
  }
};

// Run the script if called directly
if (require.main === module) {
  seedDefaultTaxes();
}

export default seedDefaultTaxes;