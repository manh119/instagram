import { Box } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import useProfilePreview from "../../hooks/useProfilePreview";
import ProfilePreview from "./ProfilePreview";

const ProfileHoverTrigger = ({
    profile,
    children,
    linkTo = null,
    showPreview = true,
    triggerRef = null
}) => {
    // Debug logging
    console.log('ProfileHoverTrigger - profile data:', {
        profile,
        hasProfile: !!profile,
        username: profile?.username,
        fullName: profile?.fullName,
        profilePicURL: profile?.profilePicURL,
        showPreview
    });

    // Always call the hook to follow React rules
    const previewHook = useProfilePreview();

    // Use provided ref or hook ref only when showing previews
    const finalTriggerRef = showPreview && profile ? (triggerRef || previewHook.triggerRef) : null;

    // Early return for cases where no preview is needed
    if (!profile || !showPreview) {
        return linkTo ? (
            <Link to={linkTo}>
                {children}
            </Link>
        ) : (
            children
        );
    }

    const content = (
        <Box
            ref={finalTriggerRef}
            onMouseEnter={previewHook.handleMouseEnter}
            onMouseLeave={previewHook.handleMouseLeave}
            position="relative"
            display="inline-block"
        >
            {children}

            {/* Profile Preview */}
            <ProfilePreview
                profile={profile}
                isVisible={previewHook.isVisible}
                position={previewHook.position}
                onMouseEnter={previewHook.handleMouseEnter}
                onMouseLeave={previewHook.handleMouseLeave}
            />
        </Box>
    );

    if (linkTo) {
        return (
            <Link to={linkTo}>
                {content}
            </Link>
        );
    }

    return content;
};

export default ProfileHoverTrigger;
