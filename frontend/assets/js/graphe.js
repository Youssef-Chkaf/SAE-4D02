// Configuration initiale du graphe
const graphe = {
  // Éléments du graphe
  svg: null,
  simulation: null,
  nodes: [],
  links: [],
  width: 600,
  height: 400,
  onNodeClick: null, // Callback pour le clic sur un nœud
  selectedNode: null, // Nœud actuellement sélectionné
  
  // Initialisation du graphe
  init: function() {
    // Sélection du conteneur et définition des dimensions
    const container = document.getElementById('graphe-container');
    this.width = container.clientWidth;
    this.height = container.clientHeight || 400;
    
    // Création du SVG avec zoom
    const svg = d3.select('#graphe-container')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);
      
    // Ajouter un groupe pour gérer le zoom
    const g = svg.append('g');
    
    // Configurer le zoom avec une valeur minimale plus petite (0.1 au lieu de 0.5)
    const zoom = d3.zoom()
      .scaleExtent([0.1, 5])  // Modifier cette ligne pour permettre un zoom arrière plus important
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    
    // Appliquer le zoom au SVG
    svg.call(zoom);
    
    // Stocker l'élément SVG et le groupe
    this.svg = g;
    this.svgRoot = svg;
    
    // Création des groupes pour les liens et les noeuds
    this.svg.append('g').attr('class', 'links');
    this.svg.append('g').attr('class', 'nodes');
    
    // Création de la simulation
    this.simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .on('tick', this.ticked.bind(this));
      
    // Événement de redimensionnement
    window.addEventListener('resize', this.resize.bind(this));
    
    // Forcer la mise à jour des dimensions après initialisation
    this.forceResize();
  },
  
  // Mettre à jour le graphe lors d'un redimensionnement
  resize: function() {
    const container = document.getElementById('graphe-container');
    this.width = container.clientWidth;
    this.height = container.clientHeight || 400;
    
    this.svgRoot
      .attr('width', this.width)
      .attr('height', this.height);
      
    this.simulation.force('center', d3.forceCenter(this.width / 2, this.height / 2));
    this.simulation.alpha(0.3).restart();
  },
  
  // Mettre à jour le graphe à chaque tick de la simulation
  ticked: function() {
    this.svg.select('.links')
      .selectAll('line')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
      
    this.svg.select('.nodes')
      .selectAll('g')
      .attr('transform', d => `translate(${d.x},${d.y})`);
  },
  
  // Charger les données initiales du graphe
  loadData: function(noeuds, liens) {
    this.nodes = noeuds;
    this.links = liens;
    this.updateGraph();
  },
  
  // Ajouter un noeud et ses liens
  addNode: function(newNode, newLinks) {
    // Vérifier si le noeud existe déjà
    const existingNode = this.nodes.find(n => n.id === newNode.id);
    if (!existingNode) {
      this.nodes.push(newNode);
    }
    
    // Ajouter les nouveaux liens
    if (newLinks && newLinks.length > 0) {
      newLinks.forEach(link => {
        const existingLink = this.links.find(l => 
          (l.source.id === link.source && l.target.id === link.target) || 
          (l.source.id === link.target && l.target.id === link.source)
        );
        
        if (!existingLink) {
          this.links.push(link);
        }
      });
    }
    
    // Mettre à jour le graphe
    this.updateGraph();
  },
  
  // Ajouter cette fonction manquante pour ajouter des liens
  addLink: function(link) {
    // Vérifier si le lien existe déjà
    const existingLink = this.links.find(l => 
      (l.source.id === link.source && l.target.id === link.target) || 
      (l.source.id === link.target && l.target.id === link.source)
    );
    
    if (!existingLink) {
      this.links.push(link);
      this.updateGraph();
    }
  },

  // Ajouter cette méthode pour déboguer les liens
  debugLinks: function() {
    console.log("Liens actuels:", JSON.stringify(this.links));
    console.log("Nœuds actuels:", JSON.stringify(this.nodes));
  },

  // Sélectionne un nœud
  selectNode: function(node) {
    // Désélectionner l'ancien nœud s'il existe
    if (this.selectedNode) {
      this.svg.select('.nodes')
        .selectAll('g')
        .filter(d => d.id === this.selectedNode.id)
        .select('circle')
        .attr('stroke', '#fff')
        .attr('stroke-width', d => d.central ? 3 : 1.5);
    }
    
    // Sélectionner le nouveau nœud
    this.selectedNode = node;
    
    // Mettre en évidence le nœud sélectionné
    this.svg.select('.nodes')
      .selectAll('g')
      .filter(d => d.id === node.id)
      .select('circle')
      .attr('stroke', '#f39c12')  // Couleur de sélection
      .attr('stroke-width', 4);
  },
  
  // Mettre à jour les nœuds pour améliorer leur apparence et interactivité
  updateGraph: function() {
    // Vérifier que le SVG existe et que les données sont disponibles
    if (!this.svg || !this.nodes || !this.links) {
      console.error("SVG ou données non disponibles", { svg: this.svg, nodes: this.nodes, links: this.links });
      return;
    }

    console.log("Mise à jour du graphe avec", this.nodes.length, "nœuds et", this.links.length, "liens");
    console.log("Liens:", this.links);
    
    const svg = this.svg;
    
    // IMPORTANT: S'assurer que les références des liens sont correctes
    // Convertir les références ID en références d'objet si nécessaire
    this.links.forEach(link => {
      if (typeof link.source === 'string' || typeof link.source === 'number') {
        const sourceNode = this.nodes.find(n => n.id === link.source);
        if (sourceNode) link.source = sourceNode;
      }
      if (typeof link.target === 'string' || typeof link.target === 'number') {
        const targetNode = this.nodes.find(n => n.id === link.target);
        if (targetNode) link.target = targetNode;
      }
    });
    
    // Mise à jour des liens
    const link = svg.select('.links')
      .selectAll('line')
      .data(this.links, d => {
        // Identifier unique pour chaque lien
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;
        return `${sourceId}-${targetId}`;
      });
    
    // Supprimer les liens qui n'existent plus
    link.exit().transition().duration(300)
      .attr('stroke-opacity', 0)
      .remove();
    
    // Ajouter les nouveaux liens
    const linkEnter = link.enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0)
      .attr('stroke-width', d => d.value || 2)
      .transition()
      .duration(500)
      .attr('stroke-opacity', 0.6);
    
    // Mise à jour des nœuds
    const node = this.svg.select('.nodes')
      .selectAll('g.node')
      .data(this.nodes, d => d.id);
    
    node.exit().transition().duration(300)
      .attr('transform', 'scale(0)')
      .remove();
    
    // Création des nouveaux nœuds avec une apparence améliorée
    const nodeEnter = node.enter()
      .append('g')
      .attr('class', 'node')
      .classed('node-film', d => d.type === 'film')
      .classed('node-acteur', d => d.type === 'acteur')
      .classed('node-central', d => d.central)
      .classed('node-discovered', d => d.discovered)
      .classed('node-unknown', d => !d.discovered && !d.central)
      .call(d3.drag()
        .on('start', this.dragstarted.bind(this))
        .on('drag', this.dragged.bind(this))
        .on('end', this.dragended.bind(this)))
      .on('click', (event, d) => {
        event.stopPropagation();  // Éviter la propagation
        if (this.onNodeClick) {
          console.log("Clic sur nœud", d);
          this.onNodeClick(d);
        }
        this.selectNode(d);
      })
      .style('cursor', 'pointer');  // Important: curseur pointer pour l'interaction
    
    // Ajouter un effet de survol (hover)
    nodeEnter
      .on('mouseover', function(event, d) {
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', function() {
            const currentR = parseFloat(d3.select(this).attr('r'));
            return currentR * 1.1;
          });
      })
      .on('mouseout', function(event, d) {
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', d => {
            if (d.central) return 40;
            return d.type === 'film' ? 30 : 20;
          });
      });
    
    // Dessiner le cercle du nœud avec une animation
    nodeEnter.append('circle')
      .attr('r', 0)  // Commencer avec rayon 0
      .attr('fill', d => {
        if (!d.discovered && !d.central) return '#aaa';
        if (d.type === 'film') return '#3498db';
        return '#e74c3c';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', d => d.central ? 3 : 1.5)
      .transition()
      .duration(500)
      .attr('r', d => {
        if (d.central) return 40;
        return d.type === 'film' ? 30 : 20;
      });
      
    // Ajouter le texte (nom/titre) pour les nœuds découverts et centraux
    nodeEnter.append('text')
      .attr('dy', d => d.central ? 55 : 35)  // Position sous le cercle
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .attr('font-size', d => d.central ? '14px' : '12px')
      .attr('font-weight', d => d.central ? 'bold' : 'normal')
      .text(d => {
        if (d.central || d.discovered) {
          // Tronquer le nom s'il est trop long
          const name = d.name || d.title || "";
          return name.length > 15 ? name.substring(0, 12) + '...' : name;
        }
        return '?'; // Point d'interrogation pour les nœuds non découverts
      })
      .attr('opacity', d => (d.central || d.discovered) ? 1 : 0.7);
        
    // Mettre à jour la simulation avec une force plus adaptée
    this.simulation.nodes(this.nodes);
    this.simulation.force('link').links(this.links);
    this.simulation.force('charge', d3.forceManyBody().strength(-400));
    this.simulation.force('link', d3.forceLink().id(d => d.id).distance(150).strength(0.8));
    this.simulation.force('center', d3.forceCenter(this.width / 2, this.height / 2));
      this.simulation.alpha(1).restart();
  },
  
  // Fonctions pour gérer le drag & drop des nœuds
  dragstarted: function(event, d) {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  },
  
  dragged: function(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  },
  
  dragended: function(event, d) {
    if (!event.active) this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  },
  
  // Marquer un noeud comme découvert
  discoverNode: function(nodeId) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      node.discovered = true;
      
      // Mettre à jour l'apparence du nœud
      this.svg.select('.nodes')
        .selectAll('g')
        .filter(d => d.id === nodeId)
        .classed('node-unknown', false)
        .classed('node-discovered', true)
        .select('circle')
        .transition()
        .duration(300)
        .attr('fill', node.type === 'film' ? '#3498db' : '#e74c3c');
        
      // Mettre à jour le texte
      this.svg.select('.nodes')
        .selectAll('g')
        .filter(d => d.id === nodeId)
        .select('text')
        .text(d => {
          const name = d.name || "";
          return name.length > 15 ? name.substring(0, 12) + '...' : name;
        })
        .attr('font-weight', 'bold')
        .attr('opacity', 1);
    }
  },
  
  // Réinitialiser le graphe
  reset: function() {
    // Vider les données
    this.nodes = [];
    this.links = [];
    this.selectedNode = null;
    
    // Supprimer tous les éléments graphiques
    this.svg.select('.links').selectAll('*').remove();
    this.svg.select('.nodes').selectAll('*').remove();
    
    // Réinitialiser la simulation
    this.simulation.nodes([]);
    this.simulation.force('link').links([]);
    this.simulation.alpha(1).restart();
  },

  // Forcer le redimensionnement du graphe après chargement
  forceResize: function() {
    // Temporiser légèrement pour s'assurer que le DOM est prêt
    setTimeout(() => {
      const container = document.getElementById('graphe-container');
      if (container) {
        this.width = container.clientWidth || 600;
        this.height = container.clientHeight || 400;
        
        if (this.svgRoot) {
          this.svgRoot
            .attr('width', this.width)
            .attr('height', this.height);
            
          if (this.simulation) {
            this.simulation.force('center', d3.forceCenter(this.width / 2, this.height / 2));
            this.simulation.alpha(0.3).restart();
          }
        }
      }
    }, 300);
  },
};