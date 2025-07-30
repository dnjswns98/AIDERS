import { Route, Routes } from "react-router-dom"
import AuthRouters from "./AuthRouters"
import UserRouters from "./UserRouters"
import HospitalRouters from "./HospitalRouters"
import AdminPage from "../pages/AdminPage"
import FireStationRouter from "./FireStationRouters"
import AmbulanceRouters from "./AmbulanceRouters";
import LoginForm from "../components/login/LoginForm";

// 모달 창 관련으로 오류가 날 수도 있다.

function AppRouters() {
    return(
        <>
        <Routes>
            <Route path="/" element={<LoginForm />} />
            <Route path="/auth/*" element={<AuthRouters />} />
            <Route path="/user/*" element={<UserRouters />} />
            <Route path="/report/*" element={<UserRouters />} />
            <Route path="/hospital/*" element={<HospitalRouters />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/firestation/*" element={<FireStationRouter /> } />
            <Route path="/emergency/*" element={<AmbulanceRouters />} />
        </Routes>
        </>
    )
}

export default AppRouters