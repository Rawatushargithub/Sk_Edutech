import { Router } from "express"
import {  getStudentCount , getRecentsStudents } from "../controllers/student.controller.js"

const router = Router()

try {
   
    router.route("/student/count").get(getStudentCount)
    router.route("/recent").get(getRecentsStudents);

} catch (error) {
    console.log("error occured in students routes " , error)
}
export default router