import { Router } from "express"
import { registerStudent , getStudents , getStudentCount , getRecentsStudents , updateStudent } from "../../controllers/Student_controller/Student.controller.js"
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
    router.route("/update/:id").put(updateStudent)

} catch (error) {
    console.log("error occured in students routes " , error)
}
export default router