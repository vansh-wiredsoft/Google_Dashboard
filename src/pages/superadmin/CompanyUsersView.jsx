import Layout from "../../layouts/commonLayout/Layout";
import EntityViewPage from "../../components/shared/EntityViewPage";
import { entityConfigs } from "../../data/adminEntityConfigs";

export default function CompanyUsersView() {
  return (
    <Layout role="admin" title="View User">
      <EntityViewPage {...entityConfigs.user} />
    </Layout>
  );
}
