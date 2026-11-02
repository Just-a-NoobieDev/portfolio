<script lang="ts">
  import type { Project } from '../lib/projects'
  import { reveal, parallaxImage } from '../lib/motion'
  let { project, index = 0 }: { project: Project; index?: number } = $props()
</script>

<article class="project-card" use:reveal={index * 0.07}>
  <a
    href={`/work/${project.slug}`}
    class="project-image"
    use:parallaxImage
    style={`--project-color:${project.color}`}
    aria-label={`Explore ${project.title}`}
    ><span class="project-number"
      >{String(project.order).padStart(2, '0')} / SELECTED WORK</span
    ><img
      src={project.image}
      alt={project.imageAlt}
      loading="lazy"
      width="1200"
      height="750"
    /><span class="project-open" aria-hidden="true">Explore <span>↗</span></span
    ></a
  >
  <div class="project-card-info">
    <h3>
      <a href={`/work/${project.slug}`}>{project.shortTitle ?? project.title}</a
      >
    </h3>
    <span class="card-arrow" aria-hidden="true">↗</span>
  </div>
  <p class="project-role">{project.role}</p>
  <div class="project-tech">{project.technologies.slice(0, 3).join(' / ')}</div>
</article>
