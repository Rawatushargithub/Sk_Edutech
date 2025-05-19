import Institute from '../models/institute.model.js';

// Get institute profile
export const getProfile = async (req, res) => {
  try {
    const institute = await Institute.findOne();
    
    if (!institute) {
      return res.status(404).json({ message: 'Institute profile not found' });
    }

    res.json(institute);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update institute profile
export const updateProfile = async (req, res) => {

    try {
      let institute = await Institute.findOne({ email: req.body.email });
      
      const updateData = {
        instituteID: req.body.instituteID,
        instituteName: req.body.instituteName,
        ownerName: req.body.ownerName,
        dob: req.body.dob,
        email: req.body.email,
        mobileNumber: req.body.mobileNumber,
        address: req.body.address,
        state: req.body.state,
        district: req.body.district,
        city: req.body.city,
        postalCode: req.body.postalCode,
        username: req.body.username
      };

      if (req.files) {
        if (req.files.profilePicture && req.files.profilePicture[0]) {
          updateData.profilePicture = '/' + req.files.profilePicture[0].path;
        }
        if (req.files.instituteLogo && req.files.instituteLogo[0]) {
          updateData.instituteLogo = '/' + req.files.instituteLogo[0].path;
        }
        if (req.files.instituteSignature && req.files.instituteSignature[0]) {
          updateData.instituteSignature = '/' + req.files.instituteSignature[0].path;
        }
      }

      if (institute) {
        institute = await Institute.findOneAndUpdate(
          { email: req.body.email },
          updateData,
          { new: true, runValidators: true }
        );
      } else {
        institute = await Institute.create(updateData);
      }

      res.json({ 
        message: 'Profile updated successfully', 
        institute 
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  
};
