import { Spin } from "antd";
import "antd/dist/reset.css";

export default function Loading() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f0f2f5" }}>
            <Spin size="large" />
        </div>
    );
} 