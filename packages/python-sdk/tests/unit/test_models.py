"""Unit tests for EAMP Pydantic models."""

import pytest
from pydantic import ValidationError
from eamp.models import (
    EAMPMetadata,
    DataPoint,
    VisualElement,
    Context,
    Scene,
    ContentType,
)


class TestDataPoint:
    """Test DataPoint model."""

    def test_valid_data_point(self):
        """Test creating a valid data point."""
        data_point = DataPoint(
            label="Q1 Sales",
            value=1200000.50,
            unit="USD"
        )
        
        assert data_point.label == "Q1 Sales"
        assert data_point.value == 1200000.50
        assert data_point.unit == "USD"

    def test_data_point_with_string_value(self):
        """Test data point with string value that can be converted."""
        data_point = DataPoint(
            label="Temperature",
            value="25.5",
            unit="Celsius"
        )
        
        assert data_point.value == 25.5
        assert isinstance(data_point.value, (int, float))

    def test_data_point_validation_error(self):
        """Test data point validation errors."""
        with pytest.raises(ValidationError) as exc_info:
            DataPoint(
                label="",  # Empty label should fail
                value=100,
                unit="USD"
            )
        
        assert "String should have at least 1 character" in str(exc_info.value)

    def test_data_point_missing_fields(self):
        """Test data point with missing required fields."""
        with pytest.raises(ValidationError):
            DataPoint(label="Sales")  # Missing value and unit


class TestVisualElement:
    """Test VisualElement model."""

    def test_valid_visual_element(self):
        """Test creating a valid visual element."""
        element = VisualElement(
            type="chart",
            description="Blue bar chart showing quarterly data",
            position="center",
            color="#0066CC",
            size="large"
        )
        
        assert element.type == "chart"
        assert element.description == "Blue bar chart showing quarterly data"
        assert element.position == "center"
        assert element.color == "#0066CC"
        assert element.size == "large"

    def test_minimal_visual_element(self):
        """Test visual element with only required fields."""
        element = VisualElement(
            type="text",
            description="Y-axis labels"
        )
        
        assert element.type == "text"
        assert element.description == "Y-axis labels"
        assert element.position is None
        assert element.color is None
        assert element.size is None

    def test_invalid_element_type(self):
        """Test visual element with invalid type."""
        with pytest.raises(ValidationError) as exc_info:
            VisualElement(
                type="invalid-type",
                description="Some description"
            )
        
        assert "Input should be" in str(exc_info.value)


class TestContext:
    """Test Context model."""

    def test_complete_context(self):
        """Test creating a complete context object."""
        context = Context(
            page_title="Q4 2024 Financial Report",
            section_heading="Sales Performance",
            purpose="Illustrate quarterly sales growth trend",
            user_task="Analyze sales performance over time",
            surrounding_text="The chart shows consistent growth"
        )
        
        assert context.page_title == "Q4 2024 Financial Report"
        assert context.section_heading == "Sales Performance"
        assert context.purpose == "Illustrate quarterly sales growth trend"
        assert context.user_task == "Analyze sales performance over time"
        assert context.surrounding_text == "The chart shows consistent growth"

    def test_empty_context(self):
        """Test creating an empty context object."""
        context = Context()
        
        assert context.page_title is None
        assert context.section_heading is None
        assert context.purpose is None
        assert context.user_task is None
        assert context.surrounding_text is None


class TestScene:
    """Test Scene model."""

    def test_complete_scene(self):
        """Test creating a complete scene object."""
        scene = Scene(
            time="0:30-2:15",
            description="Chef mixing flour and eggs",
            speakers=["Chef Maria"],
            visual_elements=["flour well", "fresh eggs"],
            audio_elements=["chef narration", "mixing sounds"]
        )
        
        assert scene.time == "0:30-2:15"
        assert scene.description == "Chef mixing flour and eggs"
        assert scene.speakers == ["Chef Maria"]
        assert scene.visual_elements == ["flour well", "fresh eggs"]
        assert scene.audio_elements == ["chef narration", "mixing sounds"]

    def test_minimal_scene(self):
        """Test scene with only required fields."""
        scene = Scene(
            time="0:00-0:30",
            description="Opening scene"
        )
        
        assert scene.time == "0:00-0:30"
        assert scene.description == "Opening scene"
        assert scene.speakers is None
        assert scene.visual_elements is None
        assert scene.audio_elements is None


class TestEAMPMetadata:
    """Test EAMPMetadata model."""

    def test_complete_metadata(self):
        """Test creating complete EAMP metadata."""
        metadata = EAMPMetadata(
            id="sales-chart-2024",
            type=ContentType.IMAGE,
            eamp_version="1.0.0",
            short_alt="Quarterly sales chart for 2024",
            extended_description="Bar chart showing steady sales growth throughout 2024",
            data_points=[
                DataPoint(label="Q1", value=1200000, unit="USD"),
                DataPoint(label="Q2", value=1500000, unit="USD")
            ],
            visual_elements=[
                VisualElement(
                    type="chart",
                    description="Blue vertical bars",
                    position="center",
                    color="blue"
                )
            ],
            accessibility_features=["high-contrast", "screen-reader-optimized"],
            tags=["finance", "sales", "quarterly"],
            context=Context(
                page_title="Financial Report",
                purpose="Show sales trends"
            )
        )
        
        assert metadata.id == "sales-chart-2024"
        assert metadata.type == ContentType.IMAGE
        assert metadata.eamp_version == "1.0.0"
        assert metadata.short_alt == "Quarterly sales chart for 2024"
        assert len(metadata.data_points) == 2
        assert len(metadata.visual_elements) == 1
        assert len(metadata.accessibility_features) == 2
        assert len(metadata.tags) == 3
        assert metadata.context is not None

    def test_minimal_metadata(self):
        """Test metadata with only required fields."""
        metadata = EAMPMetadata(
            id="test-resource",
            type=ContentType.IMAGE,
            eamp_version="1.0.0",
            short_alt="Test image"
        )
        
        assert metadata.id == "test-resource"
        assert metadata.type == ContentType.IMAGE
        assert metadata.short_alt == "Test image"
        assert metadata.data_points is None
        assert metadata.visual_elements is None
        assert metadata.accessibility_features is None
        assert metadata.tags is None
        assert metadata.context is None

    def test_video_metadata_with_scenes(self):
        """Test video metadata with transcript and scenes."""
        metadata = EAMPMetadata(
            id="cooking-tutorial",
            type=ContentType.VIDEO,
            eamp_version="1.0.0",
            short_alt="Pasta making tutorial",
            extended_description="Step-by-step pasta making tutorial",
            transcript="Chef Maria: Today we're making fresh pasta...",
            scenes=[
                Scene(
                    time="0:00-0:30",
                    description="Introduction with chef in kitchen",
                    speakers=["Chef Maria"]
                )
            ]
        )
        
        assert metadata.type == ContentType.VIDEO
        assert metadata.transcript is not None
        assert len(metadata.scenes) == 1
        assert metadata.scenes[0].speakers == ["Chef Maria"]

    def test_metadata_validation_errors(self):
        """Test metadata validation errors."""
        with pytest.raises(ValidationError):
            EAMPMetadata(
                id="test",
                type="invalid-type",  # Invalid type
                eamp_version="1.0.0",
                short_alt="Test"
            )

    def test_short_alt_length_constraint(self):
        """Test short_alt length constraint."""
        with pytest.raises(ValidationError) as exc_info:
            EAMPMetadata(
                id="test-resource",
                type=ContentType.IMAGE,
                eamp_version="1.0.0",
                short_alt="A" * 130  # Exceeds 125 character limit
            )
        
        assert "String should have at most 125 characters" in str(exc_info.value)

    def test_metadata_serialization(self):
        """Test metadata serialization to dict."""
        metadata = EAMPMetadata(
            id="test-resource",
            type=ContentType.IMAGE,
            eamp_version="1.0.0",
            short_alt="Test image",
            tags=["test", "sample"]
        )
        
        data = metadata.model_dump()
        
        assert data["id"] == "test-resource"
        assert data["type"] == "image"
        assert data["tags"] == ["test", "sample"]

    def test_metadata_json_serialization(self):
        """Test metadata JSON serialization."""
        metadata = EAMPMetadata(
            id="test-resource",
            type=ContentType.IMAGE,
            eamp_version="1.0.0",
            short_alt="Test image",
            data_points=[
                DataPoint(label="Value", value=100, unit="count")
            ]
        )
        
        json_str = metadata.model_dump_json()
        assert "test-resource" in json_str
        assert "image" in json_str
        assert "Value" in json_str

    def test_metadata_from_dict(self):
        """Test creating metadata from dictionary."""
        data = {
            "id": "test-resource",
            "type": "image",
            "eamp_version": "1.0.0",
            "short_alt": "Test image",
            "tags": ["test"]
        }
        
        metadata = EAMPMetadata.model_validate(data)
        
        assert metadata.id == "test-resource"
        assert metadata.type == ContentType.IMAGE
        assert metadata.tags == ["test"]


class TestContentType:
    """Test ContentType enum."""

    def test_content_type_values(self):
        """Test all content type values."""
        assert ContentType.IMAGE == "image"
        assert ContentType.VIDEO == "video"
        assert ContentType.AUDIO == "audio"
        assert ContentType.UI_ELEMENT == "ui-element"
        assert ContentType.DOCUMENT == "document"

    def test_content_type_from_string(self):
        """Test creating content type from string."""
        assert ContentType("image") == ContentType.IMAGE
        assert ContentType("video") == ContentType.VIDEO
        assert ContentType("ui-element") == ContentType.UI_ELEMENT