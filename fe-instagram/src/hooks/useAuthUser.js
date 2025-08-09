import useAuthStore from "../store/authStore";

const useAuthUser = () => {
    const user = useAuthStore((s) => s.user);
    return [user, false];
};

export default useAuthUser;


