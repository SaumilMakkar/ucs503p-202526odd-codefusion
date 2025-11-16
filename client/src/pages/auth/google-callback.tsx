import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@/app/hook";
import { setCredentials } from "@/features/auth/authSlice";
import { PROTECTED_ROUTES } from "@/routes/common/routePath";

const GoogleCallback = () => {
	const [params] = useSearchParams();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	useEffect(() => {
		const token = params.get("token");
		const expiresAtStr = params.get("expiresAt");
		const expiresAt = expiresAtStr ? Number(expiresAtStr) : null;

		if (!token) {
			navigate("/");
			return;
		}

		(async () => {
			try {
				// Temporarily set token so we can fetch user
				dispatch(
					setCredentials({
						accessToken: token,
						expiresAt,
						user: null,
						reportSetting: null,
					})
				);

				// Fetch current user
				const base = import.meta.env.VITE_API_URL;
				const resp = await fetch(`${base}/user/current-user`, {
					headers: { Authorization: `Bearer ${token}` },
					credentials: "include",
				});
				const data = await resp.json();

				dispatch(
					setCredentials({
						accessToken: token,
						expiresAt,
						user: data?.user ?? null,
						reportSetting: null,
					})
				);

				navigate(PROTECTED_ROUTES.OVERVIEW);
			} catch (_e) {
				navigate("/");
			}
		})();
	}, [params, dispatch, navigate]);

	return null;
};

export default GoogleCallback;


