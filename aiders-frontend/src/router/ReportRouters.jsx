import { Route, Routes } from "react-router-dom";

function ReportRouter() {
    return(
        <>
            <Routes>
                <Route path="/" loader />
                <Route path="/search" element />
                <Route path="/" element />
            </Routes>
        </>
    )
}

export default ReportRouter 