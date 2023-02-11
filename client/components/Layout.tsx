import { ReactElement } from "react";
import Header from "./Header";
import Footer from "./Footer";

const Layout = (props: { children: ReactElement }) => {
  return (
    <div>
      <Header />
      {props.children}
      <Footer />
    </div>
  );
};

export default Layout;
