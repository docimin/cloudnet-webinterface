import NodePage from '@/components/nodePage';

export default function Node({ node }) {
  return <NodePage node={node} />;
}

export async function getServerSideProps(context) {
  const { uniqueId } = context.query;
  const token = getCookie('token');
  if (token) {
    const response = await fetch(`https://cors.fayevr.dev/proxy-api.fayevr.dev/api/v2/cluster/${uniqueId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    console.log(data);
    return {
      props: {
        node: data.node
      }
    };
  }
  return {
    props: {
      node: {}
    }
  };
}