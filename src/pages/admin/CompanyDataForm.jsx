import Layout from "../../layouts/commonLayout/Layout";
import EntityFormPage from "../../components/shared/EntityFormPage";
import { entityConfigs } from "../../data/adminEntityConfigs";

export default function CompanyDataForm({ mode }) {
  return (
    <Layout
      role="superadmin"
      title={mode === "edit" ? "Edit Company" : "Add Company"}
    >
      <EntityFormPage mode={mode} {...entityConfigs.company} />
    </Layout>
  );
}
