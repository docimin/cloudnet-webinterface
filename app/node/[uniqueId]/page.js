function ClusterNodeEditPage({ node }) {
    // render the edit form using the `node` prop
  }
  
  export async function getServerSideProps(context) {
    const { uniqueId } = context.query;
    // make a GET request to `/node/${uniqueId}` to fetch the node information
    const node = await fetch(`/node/${uniqueId}`).then((res) => res.json());
    return {
      props: {
        node,
      },
    };
  }
  
  export default ClusterNodeEditPage;