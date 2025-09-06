
class ApiResponse <T>{
    statusCode:number;data:T;massage:string;isSuccess:boolean
    constructor(statusCode:number,data:T,massage:string="success"){
        this.statusCode=statusCode,
        this.data=data,
        this.massage=massage
        this.isSuccess= statusCode < 400
    }
}

export default ApiResponse