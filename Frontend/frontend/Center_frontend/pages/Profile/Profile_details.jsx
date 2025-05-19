import React, { useState,useEffect } from 'react';
// import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile_details = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [profilePic, setProfilePic] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    instituteID: "",
    instituteName: "",
    ownerName: "",
    dob: "",
    email: "",
    mobileNumber: "",
    address: "",
    state: "",
    district: "",
    city: "",
    postalCode: "",
    username: "",
    instituteLogo: null,
    instituteSignature: null,
  });

   // Fetch profile data when component mounts
   useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/institute/profile');
        if (!response.ok) throw new Error('Failed to fetch profile data');
        const profileData = await response.json();
        
        // Update form data with fetched data
        setFormData(prevData => ({
          ...prevData,
          instituteID: profileData.instituteID || '',
          instituteName: profileData.instituteName || '',
          ownerName: profileData.ownerName || '',
          dob: profileData.dob || '',
          email: profileData.email || '',
          mobileNumber: profileData.mobileNumber || '',
          address: profileData.address || '',
          state: profileData.state || '',
          district: profileData.district || '',
          city: profileData.city || '',
          postalCode: profileData.postalCode || '',
          username: profileData.username || '',
          instituteLogo: profileData.instituteID,
          instituteSignature: profileData.instituteLogo
        }));

        // Set profile picture if exists
        if (profileData.profilePicture) {
          setProfilePic(profileData.profilePicture);
        }

      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const validateForm = (formData) => {
    const errors = {};
  
    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
  
    // Mobile number validation
    if (formData.mobileNumber && !/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      errors.mobileNumber = 'Invalid mobile number';
    }
  
    // Postal code validation
    if (formData.postalCode && !/^\d{6}$/.test(formData.postalCode)) {
      errors.postalCode = 'Invalid postal code';
    }
  
    // Mandatory fields
    const mandatoryFields = [
      'instituteID', 'instituteName', 'ownerName', 
      'email', 'mobileNumber', 'address', 
      'state', 'district', 'city', 'postalCode'
    ];
  
    mandatoryFields.forEach(field => {
      if (!formData[field]) {
        errors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
      }
    });
  
    return errors;
  };
  

  const statesWithDistricts = {
    "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Kadapa", "Krishna", "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari"],
       "Arunachal Pradesh": ["Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey", "Kra Daadi", "Lower Subansiri", "Upper Subansiri", "West Siang", "East Siang", "Siang", "Upper Dibang Valley", "Lower Dibang Valley", "Dibang Valley", "Anjaw", "Lohit", "Namsai", "Changlang", "Tirap", "Longding"],
       "Assam": ["Baksa", "Barpeta", "Bieo", "Bongaigaon", "Cachar", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "Tinsukia", "Udalguri", "Charaideo"],
       "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
       "Chhattisgarh": ["Balod", "Balrampur", "Bametara", "Bastar", "Bigelow", "Bilaspur", "Dantewara", "Dhamtari", "Durg", "Gariaband", "Jashpur", "Kanker", "Kawardha", "Kondagaon", "Korba", "Korea", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
       "Goa": ["North Goa", "South Goa"],
       "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Tapi", "Valsad"],
       "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
       "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
       "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"],
       "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajnagar", "Chikballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davangere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada"],
       "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
       "Madhya Pradesh": ["Agar", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
       "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
       "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
       "Meghalaya": ["East Garo Hills", "East Khasi Hills", "Garo Hills West", "Jaintia Hills East", "Jaintia Hills West", "North Garo Hills", "Ribhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Khasi Hills"],
       "Mizoram": ["Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Serchhip"],
       "Nagaland": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"],
       "Odisha": ["Angul", "Balasore", "Baragarh", "Berhampur", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"],
       "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Firozpur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Mohali", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sangrur", "Tarn Taran"],
       "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
       "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
       "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kancheepuram", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thiruvallur", "Thiruvarur", "Thoothukkudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvottiyur", "Vellore", "Viluppuram", "Virudhunagar"],
       "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalapalli", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Nagarkurnool", "Nalgonda", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal Rural", "Warangal Urban", "Yadadri Bhuvanagiri"],
       "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
       "Uttar Pradesh": ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Azamgarh", "Badaun", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Faizabad", "Fatehgarh", "Fatehpur", "Firozabad", "Gautambudh Nagar", "Ghaziabad", "Ghazipur", "Gorakhpur", "Hamirpur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Khiri", "Kushi Nagar", "Lalitpur", "Lucknow", "Mahoba", "Mahendragarh", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Raibareilly", "Rampur", "Saharanpur", "Sant Kabirnagar", "Shahjahanpur", "Shraw"],
       "Uttarakhand" : ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudra Prayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
       "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Medinipur", "Paschim Burdwan", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"],

 };

  const handleFileChange = (e, key) => {
    setFormData({ ...formData, [key]: e.target.files[0] });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "state") {
      setFormData({ ...formData, state: value, district: "" }); // Reset district when state changes
    }
  };

  const handleProfilePicChange = (e) => {
    setProfilePic(URL.createObjectURL(e.target.files[0]));
  };

  // Submit handler with validation and API call
  const handleSubmit = async () => {
    const validationErrors = validateForm(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      console.log("Error occured")
      return;
    }

    setIsSubmitting(true);

    // Create FormData for file uploads
    const formDataToSubmit = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        formDataToSubmit.append(key, formData[key]);
      }
    });

    try {
      const response = await axios.post('/api/institute/profile', formDataToSubmit, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert('Profile submitted successfully');
      navigate('/institute/profile');
      // Handle successful submission
      
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancel = () => {
    navigate("/institute");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center px-4 py-6">
      {/* Header Section */}
      <div className="relative w-full h-24 bg-black text-white flex items-center">
        <div className="absolute bottom-0 left-10 transform translate-y-1/2">
          <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-gray-300 bg-gray-100">
            <img
              src={profilePic || "https://via.placeholder.com/150"}
              className="object-cover w-full h-full"
            />
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleProfilePicChange}
            />
          </div>
        </div>
        <div className="ml-40">
          <h1 className="text-2xl font-bold">Owner Name</h1>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full   grid grid-cols-3 gap-6 relative mt-20">
        {[
          { label: "Institute ID", name: "instituteID", type: "text" },
          { label: "Institute Name", name: "instituteName", type: "text" },
          { label: "Owner Name", name: "ownerName", type: "text" },
          { label: "Date of Birth", name: "dob", type: "date" },
          { label: "Email", name: "email", type: "email" },
          { label: "Mobile Number", name: "mobileNumber", type: "tel" },
          { label: "Address", name: "address", type: "text" },
        ].map((field) => (
          <div key={field.name} className="flex flex-col">
            <label className="font-medium text-gray-700">{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleInputChange}
              className="border border-gray-300 rounded p-2 mt-1"
            />
          </div>
        ))}

        <div className="flex flex-col col-span-1 ">
          <label className="font-medium text-gray-700">State</label>
          <select
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className="border border-gray-300  rounded p-2 "
            
          >
            <option value="">Select State</option>
            {Object.keys(statesWithDistricts).map((state) => (
              <option key={state} value={state} className='text-black w-full'>{state}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col col-span-1">
          <label className="font-medium text-gray-700">District</label>
          <select
            name="district"
            value={formData.district}
            onChange={handleInputChange}
            className="border border-gray-300 rounded p-2 mt-1"
            disabled={!formData.state}
          >
            <option value="">Select District</option>
            {(statesWithDistricts[formData.state] || []).map((district) => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>

        {[
          { label: "City", name: "city", type: "text" },
          { label: "Postal Code", name: "postalCode", type: "number" },
          { label: "UserName", name: "username", type: "text" },
        ].map((field) => (
          <div key={field.name} className="flex flex-col">
            <label className="font-medium text-gray-700">{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleInputChange}
              className="border border-gray-300 rounded p-2 mt-1"
            />
          </div>
        ))}

        {[
          { label: "Institute Logo", name: "instituteLogo" },
          { label: "Institute Signature", name: "instituteSignature" },
        ].map((field, index) => (
          <div key={field.name} className={`flex flex-col ${index === 0 ? 'col-span-2' : 'col-span-1'}`}>
            <label className="font-medium text-gray-700">{field.label}</label>
            <input
              type="file"
              onChange={(e) => handleFileChange(e, field.name)}
              className="mt-1"
            />
            {formData[field.name] && (
              <img
                src={URL.createObjectURL(formData[field.name])}
                alt={field.label}
                className={`mt-2 border border-gray-300 ${index === 0 ? 'h-16 w-32' : 'h-16 w-16'}`}
              />
            )}
          </div>
        ))}

<div className="col-span-3 flex justify-end space-x-4 mt-4">
          <button
            type="button"
            className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile_details;