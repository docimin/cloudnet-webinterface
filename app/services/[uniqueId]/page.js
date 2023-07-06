import ServicePage from '@/components/services/servicePage';

export default function Service({ service }) {
  return <ServicePage service={service} />;
}

export async function getServerSideProps(context) {
  const { uniqueId } = context.query;
  const token = getCookie('token');
  if (token) {
    const response = await fetch(
      `https://cors.fayevr.dev/proxy-api.fayevr.dev/api/v2/service/${uniqueId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    console.log(data);
    return {
      props: {
        service: data.services
      }
    };
  }
  return {
    props: {
      service: {}
    }
  };
}
