import { Route, Routes } from "react-router-dom"
import LoginForm from "../components/login/LoginForm";

function AuthRouters() {
    return(
        <>
            <Routes>
                <Route path="/login" element={<LoginForm />} />
            </Routes>
        </>
    )
}
export default AuthRouters