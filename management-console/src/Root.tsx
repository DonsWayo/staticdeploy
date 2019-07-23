import Layout from "antd/lib/layout";
import React from "react";
import { Redirect, Route } from "react-router-dom";

import authTokenService from "./common/authTokenService";
import LoginMask from "./components/LoginMask";
import Logo from "./components/Logo";
import LogoutButton from "./components/LogoutButton";
import SiderNav from "./components/SiderNav";
import Apps from "./pages/Apps";
import Bundles from "./pages/Bundles";
import OperationLogs from "./pages/OperationLogs";
import "./Root.css";

export default class Root extends React.Component {
    render() {
        return (
            <LoginMask authTokenService={authTokenService}>
                <Layout className="c-Root">
                    <Layout.Sider
                        className="c-Root-sider"
                        collapsible={true}
                        collapsed={true}
                        collapsedWidth={64}
                        trigger={null}
                    >
                        <div className="c-Root-logo-container">
                            <Logo />
                        </div>
                        <SiderNav />
                        <div className="c-Root-logout-button-container">
                            <LogoutButton authTokenService={authTokenService} />
                        </div>
                    </Layout.Sider>
                    <Layout.Content className="c-Root-content">
                        <Route
                            path="/"
                            exact={true}
                            render={() => <Redirect to="/apps" />}
                        />
                        <Route path="/apps" component={Apps} />
                        <Route path="/bundles" component={Bundles} />
                        <Route
                            path="/operationLogs"
                            component={OperationLogs}
                        />
                    </Layout.Content>
                </Layout>
            </LoginMask>
        );
    }
}
