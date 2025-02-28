//for handler response their no such library like error in node js
// and the response handling part is done by express also express doesn't 
// provide this type of functionality like error in node

// this is done for making the process streamline

class ApiResponse {
    constructor(statusCode , data , message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode <400
        //server has its statusCode , a standardized statusCode
    }
}
export { ApiResponse };
