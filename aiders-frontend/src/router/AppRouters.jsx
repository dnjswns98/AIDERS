import { Route, Routes } from "react-router-dom"
import AuthRouters from "./AuthRouters"
import UserRouters from "./UserRouters"



// 모달 창 관련으로 오류가 날 수도 있다.

function AppRouters() {
    return(
        <>
        <Routes>
            <Route path="/auth/*" element={<AuthRouters />} />
            <Route path="/user/*" element={<UserRouters />} />
            <Route path="/report/*" element={<UserRouters />} />
        </Routes>
        </>
    )
}

export default AppRouters