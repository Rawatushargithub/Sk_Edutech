import { Router } from "express"
import { registerStudent , getStudents , getStudentCount , getRecentsStudents , toggleStudentStatus ,updateStudent, generateAdmissionForm, generateIdCard} from "../../controllers/Student_controller/Student.controller.js"
import { upload } from "../../middlewares/multer.middleware.js";
const router = Router()

try {
    router.route("/register_student").post( 
        upload.fields( // the curely braces are the fields and we are taking the fields of array to taking the avatar and coverImage from frontend
        [    { 
                 name: "studentPhoto",
                 maxCount: 1
             },
             {
                 name: "studentSignature",  
                 maxCount: 1
             }
         ]
     ),registerStudent )

     router.route("/get_students")
    .get(getStudents);
    router.route("/count").get(getStudentCount)
    router.route("/recent").get(getRecentsStudents);
    // Updated route to handle file uploads for student updates
    router.route("/update/:id").put(
        upload.fields([
            {
                name: "studentPhoto",
                maxCount: 1
            },
            {
                name: "studentSignature",
                maxCount: 1
            }
        ]),
        updateStudent
    );
    router.patch("/toggle_status/:id", toggleStudentStatus);
    router.route("/:studentId/admission-form").get(generateAdmissionForm);
    router.route("/:studentId/id-card").get(generateIdCard);

} catch (error) {
    console.log("error occured in students routes " , error)
}
export default router
