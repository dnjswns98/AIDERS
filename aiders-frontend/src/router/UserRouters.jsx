import { Route, Routes } from "react-router-dom"

function UserRouters() {
    return(
        <>
            <Routes>
                <Route path="/register/ambulance" />
                <Route path="/register/station" />
                <Route path="/password/auth" />
                <Route path="/password/change" />
                <Route path="/" />
                <Route path="/search" />
                <Route path="/:userId" /> {/* 이부분은 나중에 다시 수정 */}
            </Routes>
        </>
    )
}
export default UserRouters