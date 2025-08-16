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
    // Always call the hook to follow React rules
    const previewHook = useProfilePreview();

    // Use provided ref or hook ref only when showing previews
    const finalTriggerRef = showPreview && profile ? (triggerRef || previewHook.triggerRef) : null;

    // If no profile or preview disabled, just render children
    if (!profile || !showPreview) {
        return linkTo ? (
            <Link to={linkTo}>
                {children}
            </Link>
        ) : (
            children
        );
    }

    // Always render the wrapper with ProfilePreview when profile exists
    const content = (
        <Box
            ref={finalTriggerRef}
            onMouseEnter={previewHook.handleMouseEnter}
            onMouseLeave={previewHook.handleMouseLeave}
            position="relative"
            display="inline-block"
            cursor="pointer"
            _hover={{ opacity: 0.8 }}
            transition="opacity 0.2s"
        >
            {children}

            {/* ProfilePreview is always rendered when profile exists to prevent hooks order issues */}
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
