import { useEffect, useState } from "react";
import api from "../utils/axiosInstance";

export default function RGPVUpdates() {

    const [notices, setNotices] = useState([]);

    useEffect(() => {

        api.get("/rgpv")
            .then(res => setNotices(res.data.notices));

    }, []);

    return (

        <div className="space-y-4">

            <h1 className="text-2xl font-bold">
                📢 RGPV Latest Updates
            </h1>

            {notices.map((n, i) => (
                <div key={i} className="card">
                    {n.message}
                </div>
            ))}

        </div>

    );

}