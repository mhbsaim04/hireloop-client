import { JobForm } from "@/app/dashboard/recruiter/jobs/new/page";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7000'

export const createJob = async (data: JobForm) =>{
    const res = await fetch(`${BASE_URL}/jobs`, {
        method: "POST",
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(data),
    });
    return res.json();
}