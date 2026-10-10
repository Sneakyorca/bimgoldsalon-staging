import AuthCardLayout from "@/components/auth/AuthCardLayout";
import EditProfileForm from "@/components/profile/EditProfileForm";

const EditProfilePage = () => {
  // TODO: load the signed-in user's real data
  const user = { name: "Alex Smith", email: "alex@example.com", phone: "" };

  return (
    <AuthCardLayout
      heading="Your Profile"
      subheading="Keep your details up to date"
      backTo={{ label: "Home", href: "/" }}
    >
      <EditProfileForm user={user} />
    </AuthCardLayout>
  );
};

export default EditProfilePage;
