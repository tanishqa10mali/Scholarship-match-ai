// DEMO DATA ONLY. These are fictional sample records, not real schemes.
// Replace with verified records from official sources before real use.
const S = (id, name, level, loc, inc, marks, field, cat, deadline) => ({
  id, name, provider: "Demo Foundation (fictional)", educationLevel: level, location: loc,
  incomeLimit: inc, minMarks: marks, field, category: cat, deadline,
  eligibility: `DEMO: ${level} students${loc === "All India" ? "" : " from " + loc}, family income up to ₹${inc.toLocaleString("en-IN")}${marks ? ", at least " + marks + "% marks" : ""}.`,
  applicationUrl: "https://example.org/demo-scholarship/" + id,
  source: "DEMO DATA - fictional sample record", isDemo: true,
});
export const scholarships = [
  S("demo-1", "Demo Merit Scholarship", "Undergraduate", "All India", 800000, 75, "Any", "Any", "2099-12-31 (demo)"),
  S("demo-2", "Demo Engineering Support Grant", "Undergraduate", "Maharashtra", 500000, 60, "Engineering", "Any", "2099-11-30 (demo)"),
  S("demo-3", "Demo Girls in STEM Award", "Undergraduate", "All India", 600000, 65, "Science", "Female", "2099-10-31 (demo)"),
  S("demo-4", "Demo Postgraduate Research Aid", "Postgraduate", "All India", 1000000, 70, "Any", "Any", "2099-09-30 (demo)"),
  S("demo-5", "Demo Class 12 Bright Future", "Class 12", "Karnataka", 300000, 80, "Any", "Any", "2099-08-31 (demo)"),
  S("demo-6", "Demo Inclusive Education Fund", "Undergraduate", "All India", 400000, 0, "Any", "Disability", "2099-07-31 (demo)"),
  S("demo-7", "Demo Diploma Skills Grant", "Diploma", "All India", 350000, 50, "Any", "Any", "2099-06-30 (demo)"),
  S("demo-8", "Demo Commerce Starter Scholarship", "Undergraduate", "Maharashtra", 450000, 55, "Commerce", "Any", "2099-05-31 (demo)"),
];
export const LEVELS = ["Class 12", "Diploma", "Undergraduate", "Postgraduate", "PhD"];
export const CATEGORIES = ["General", "OBC", "SC", "ST", "EWS", "Female", "Disability", "Minority"];
export const STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"];
