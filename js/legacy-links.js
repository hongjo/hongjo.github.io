(() => {
 const parts = location.hash.slice(1).split('/');
 const pages = new Set(['home','members','publications','projects','teaching','blog','album']);
 if (!pages.has(parts[0])) return;
 const posts = ["dsdl-tiny-object-detection", "rag-construction-retrieval-optimization", "frequency-aware-crack-segmentation", "context-aware-lvlm-safety", "auto-training-data-generation", "vision-based-safety"];
 let target = '/ko/' + (parts[0] === 'home' ? '' : parts[0] + '/');
 if (parts[0] === 'blog' && /^\d+$/.test(parts[1] || '') && posts[Number(parts[1])]) target += posts[Number(parts[1])] + '/';
 location.replace(target);
})();
