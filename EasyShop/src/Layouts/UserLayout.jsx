
import { Outlet } from "react-router-dom";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import SearchBar from "../Components/SearchBar";
import LanguageBar from "../Components/LanguageBar";

const UserLayout = () => {
    return (
        <>
            {/* <LanguageBar /> */}
            <SearchBar />
            <Header />
            <Outlet />
            <Footer />
        </>
    );
};

export default UserLayout;
