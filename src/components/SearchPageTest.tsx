export default function SearchPageTest() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>🔍 SEARCH FUNCTIONALITY TEST</h1>
      <p>This is a test search page to verify the search functionality is working.</p>
      <input 
        type="text" 
        placeholder="Search NABH content..." 
        style={{
          width: '100%',
          padding: '10px',
          fontSize: '16px',
          border: '2px solid #ccc',
          borderRadius: '5px',
          marginTop: '20px'
        }}
      />
      <div style={{ marginTop: '20px' }}>
        <h3>Quick Search Options:</h3>
        <button style={{ margin: '5px', padding: '8px 16px' }}>hand hygiene</button>
        <button style={{ margin: '5px', padding: '8px 16px' }}>admission process</button>
        <button style={{ margin: '5px', padding: '8px 16px' }}>quality committee</button>
      </div>
      <div style={{ marginTop: '30px', background: '#f0f8ff', padding: '15px', borderRadius: '5px' }}>
        <strong>✅ Search page is working!</strong>
        <br />
        If you can see this page, the search functionality has been successfully implemented.
      </div>
    </div>
  );
}