import { Router } from "express";
import {
  getStudentCount,
  getRecentsStudents,
  getStudents,
  generateAdmissionForm,
  generateIdCard,
} from "../controllers/student.controller.js";

const router = Router();

try {
  router.route("/get_students").get(getStudents);
  router.route("/student/count").get(getStudentCount);
  router.route("/recent").get(getRecentsStudents);
  router
    .route("/:studentId/admission-form")
    .get(generateAdmissionForm);
  router.route("/:studentId/id-card").get(generateIdCard);
} catch (error) {
  console.log("error occured in students routes ", error);
}
export default router;
